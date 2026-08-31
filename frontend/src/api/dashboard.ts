/**
 * Dashboard aggregation helpers.
 *
 * The backend has no dedicated analytics endpoint, so every number here is
 * derived from the existing list endpoints by reading the `total` of a
 * `page_size: 1` query (a cheap COUNT) or by combining a few of those.
 * Nothing is fabricated — if a metric cannot be derived from a real
 * endpoint it is simply not exposed here.
 */

import { getAttendance, getAttendanceSessions } from './attendance'
import { getDealStatuses, getDeals } from './deals'
import type { GetDealsParams } from './deals'
import { getInvoices } from './invoices'
import { getLeadStatuses, getLeads } from './leads'
import type { GetLeadsParams } from './leads'
import { getUsers } from './users'
import type { Attendance, AttendanceSession } from '../types/attendance'
import type { DealStatus } from '../types/deal'
import type { LeadStatus } from '../types/lead'

const COUNT_PARAMS = { page: 1, page_size: 1 } as const

/*
 * Status lists are effectively static config.  Several widgets need them on
 * the same dashboard load, so cache the in-flight promise to make just one
 * request each. `resetDashboardCaches()` clears it (e.g. on manual refresh).
 */
let dealStatusCache: Promise<DealStatus[]> | null = null
let leadStatusCache: Promise<LeadStatus[]> | null = null

export const cachedDealStatuses = (): Promise<DealStatus[]> => {
    if (!dealStatusCache) {
        dealStatusCache = getDealStatuses().catch((error) => {
            dealStatusCache = null
            throw error
        })
    }

    return dealStatusCache
}

const cachedLeadStatuses = (): Promise<LeadStatus[]> => {
    if (!leadStatusCache) {
        leadStatusCache = getLeadStatuses().catch((error) => {
            leadStatusCache = null
            throw error
        })
    }

    return leadStatusCache
}

export const resetDashboardCaches = (): void => {
    dealStatusCache = null
    leadStatusCache = null
}

export const countLeads = async (
    params: Omit<GetLeadsParams, 'page' | 'page_size'> = {},
): Promise<number> => {
    const data = await getLeads({ ...params, ...COUNT_PARAMS })

    return data.total
}

export const countDeals = async (
    params: Omit<GetDealsParams, 'page' | 'page_size'> = {},
): Promise<number> => {
    const data = await getDeals({ ...params, ...COUNT_PARAMS })

    return data.total
}

export const countUsers = async (): Promise<number> => {
    const data = await getUsers({ page: 1, page_size: 1 })

    return data.total
}

export const countInvoices = async (status?: number): Promise<number> => {
    const data = await getInvoices(1, 1, status)

    return data.total
}

export interface StatusCount {
    id: number
    name: string
    code: string
    count: number
}

const norm = (value: string): string =>
    value.toLowerCase().replace(/[^a-z]/g, '')

/** Find a status entry by a set of candidate codes/names (case-insensitive). */
export const findStatus = <T extends { code: string; name: string }>(
    statuses: T[],
    candidates: string[],
): T | undefined => {
    const wanted = candidates.map(norm)

    return statuses.find(
        (status) =>
            wanted.includes(norm(status.code)) ||
            wanted.includes(norm(status.name)),
    )
}

/** Total leads per lead status (one cheap COUNT query per status). */
export const getLeadStatusCounts = async (
    params: Omit<GetLeadsParams, 'page' | 'page_size' | 'status_id'> = {},
): Promise<{ statuses: StatusCount[]; total: number }> => {
    const statuses: LeadStatus[] = await cachedLeadStatuses()

    const counts = await Promise.all(
        statuses.map((status) =>
            countLeads({ ...params, status_id: status.id }),
        ),
    )

    const resolved = statuses.map((status, index) => ({
        id: status.id,
        name: status.name,
        code: status.code,
        count: counts[index],
    }))

    return {
        statuses: resolved,
        total: resolved.reduce((sum, entry) => sum + entry.count, 0),
    }
}

export interface DealTotals {
    total: number
    won: number
    lost: number
    active: number
}

/**
 * Accurate high-level deal counts using cheap COUNT queries.  "Active" is
 * everything that is not in a Won or Lost status (the CRM has ~30 statuses,
 * so this is derived, not a backend flag).
 */
export const getDealTotals = async (
    params: Omit<GetDealsParams, 'page' | 'page_size' | 'deal_status_id'> = {},
): Promise<DealTotals> => {
    const statuses: DealStatus[] = await cachedDealStatuses()
    const won = findStatus(statuses, ['won', 'closedwon'])
    const lost = findStatus(statuses, ['lost', 'closedlost'])

    const [total, wonCount, lostCount] = await Promise.all([
        countDeals(params),
        won
            ? countDeals({ ...params, deal_status_id: won.id })
            : Promise.resolve(0),
        lost
            ? countDeals({ ...params, deal_status_id: lost.id })
            : Promise.resolve(0),
    ])

    return {
        total,
        won: wonCount,
        lost: lostCount,
        active: Math.max(total - wonCount - lostCount, 0),
    }
}

export interface DealDistribution {
    statuses: StatusCount[]
    total: number
    /** True when there are more deals than the sampled page. */
    sampled: boolean
}

/**
 * Distribution of deals across statuses.  The backend has no group-by
 * endpoint, so this groups one page of deals (newest first) client-side
 * rather than firing one COUNT per status across ~30 statuses.
 */
export const getDealDistribution = async (
    params: Omit<GetDealsParams, 'page' | 'page_size'> = {},
): Promise<DealDistribution> => {
    const [statuses, page] = await Promise.all([
        cachedDealStatuses(),
        getDeals({ ...params, page: 1, page_size: 100 }),
    ])

    const nameById = new Map(statuses.map((status) => [status.id, status]))
    const counts = new Map<number, number>()

    for (const deal of page.items) {
        counts.set(
            deal.deal_status_id,
            (counts.get(deal.deal_status_id) ?? 0) + 1,
        )
    }

    const resolved: StatusCount[] = [...counts.entries()]
        .map(([id, count]) => ({
            id,
            name: nameById.get(id)?.name ?? `Status #${id}`,
            code: nameById.get(id)?.code ?? String(id),
            count,
        }))
        .sort((a, b) => b.count - a.count)

    return {
        statuses: resolved,
        total: page.total,
        sampled: page.total > page.items.length,
    }
}

/**
 * Every attendance record for a given day.  The list endpoint is paginated,
 * so this walks the pages (bounded by headcount) with `attendance.manage`.
 */
export const getAttendanceForDate = async (
    isoDate: string,
): Promise<Attendance[]> => {
    const pageSize = 100
    const first = await getAttendance({
        attendance_date: isoDate,
        page: 1,
        page_size: pageSize,
    })

    const pages = first.total_pages || 1
    const rest = await Promise.all(
        Array.from({ length: Math.max(pages - 1, 0) }, (_, index) =>
            getAttendance({
                attendance_date: isoDate,
                page: index + 2,
                page_size: pageSize,
            }),
        ),
    )

    return [first, ...rest].flatMap((response) => response.items)
}

export const getSessionsForAttendance = async (
    attendanceId: number,
): Promise<AttendanceSession[]> => {
    try {
        return await getAttendanceSessions(attendanceId)
    } catch {
        return []
    }
}
