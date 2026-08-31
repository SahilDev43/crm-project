import {
    BadgeCheck,
    Briefcase,
    CalendarClock,
    CircleUser,
    FileText,
    Handshake,
    UserRound,
    Users,
} from 'lucide-react'

import {
    countInvoices,
    countLeads,
    countUsers,
    getAttendanceForDate,
    getDealTotals,
    getSessionsForAttendance,
} from '../../api/dashboard'
import { todayKey, utcDateKey } from './dashboardData'
import StatCard from './StatCard'
import { useWidget } from './useWidget'
import type { DashboardExperience } from './experience'

interface SummaryCardsProps {
    experience: DashboardExperience
    userId: number
}

/* ---- Admin: company-wide CRM ---- */

function AdminCards() {
    const state = useWidget(async () => {
        const [leads, deals, outstanding] = await Promise.all([
            countLeads(),
            getDealTotals(),
            (async () => {
                // Outstanding = issued + partially paid + overdue (statuses
                // 2 / 3 / 5 in the app's invoice status convention).
                const [issued, partial, overdue] = await Promise.all([
                    countInvoices(2),
                    countInvoices(3),
                    countInvoices(5),
                ])

                return issued + partial + overdue
            })(),
        ])

        return {
            leads,
            active: deals.active,
            won: deals.won,
            outstanding,
        }
    }, [])

    const { data, loading, error } = state

    return (
        <>
            <StatCard
                label="Total Leads"
                value={data?.leads ?? null}
                icon={Users}
                tone="blue"
                loading={loading}
                error={Boolean(error)}
            />
            <StatCard
                label="Active Deals"
                value={data?.active ?? null}
                icon={Handshake}
                tone="green"
                loading={loading}
                error={Boolean(error)}
            />
            <StatCard
                label="Won Deals"
                value={data?.won ?? null}
                icon={BadgeCheck}
                tone="purple"
                loading={loading}
                error={Boolean(error)}
            />
            <StatCard
                label="Outstanding Invoices"
                value={data?.outstanding ?? null}
                icon={FileText}
                tone="amber"
                loading={loading}
                error={Boolean(error)}
            />
        </>
    )
}

/* ---- HR: people + attendance ---- */

function HrCards() {
    const state = useWidget(async () => {
        const [employees, records] = await Promise.all([
            countUsers(),
            getAttendanceForDate(utcDateKey()).then((rows) =>
                rows.length > 0 ? rows : getAttendanceForDate(todayKey()),
            ),
        ])

        const presentUserIds = new Set(records.map((row) => row.user_id))

        const sessionLists = await Promise.all(
            records.map((row) => getSessionsForAttendance(row.id)),
        )

        const working = sessionLists.filter((sessions) =>
            sessions.some((session) => session.punch_out_at === null),
        ).length

        return {
            employees,
            present: presentUserIds.size,
            absent: Math.max(employees - presentUserIds.size, 0),
            working,
        }
    }, [])

    const { data, loading, error } = state
    const err = Boolean(error)

    return (
        <>
            <StatCard
                label="Total Employees"
                value={data?.employees ?? null}
                icon={Users}
                tone="blue"
                loading={loading}
                error={err}
            />
            <StatCard
                label="Present Today"
                value={data?.present ?? null}
                icon={UserRound}
                tone="green"
                loading={loading}
                error={err}
                hint={
                    data ? `of ${data.employees} employees` : undefined
                }
            />
            <StatCard
                label="Absent Today"
                value={data?.absent ?? null}
                icon={CircleUser}
                tone="red"
                loading={loading}
                error={err}
            />
            <StatCard
                label="Currently Working"
                value={data?.working ?? null}
                icon={CalendarClock}
                tone="amber"
                loading={loading}
                error={err}
            />
        </>
    )
}

/* ---- Normal user: only their own deals ---- */

function UserCards({ userId }: { userId: number }) {
    const state = useWidget(
        () => getDealTotals({ assigned_to: userId }),
        [userId],
    )

    const { data, loading, error } = state
    const err = Boolean(error)

    return (
        <>
            <StatCard
                label="My Active Deals"
                value={data?.active ?? null}
                icon={Briefcase}
                tone="green"
                loading={loading}
                error={err}
            />
            <StatCard
                label="My Won Deals"
                value={data?.won ?? null}
                icon={BadgeCheck}
                tone="purple"
                loading={loading}
                error={err}
            />
        </>
    )
}

function SummaryCards({ experience, userId }: SummaryCardsProps) {
    if (experience === 'admin') {
        return <AdminCards />
    }

    if (experience === 'hr') {
        return <HrCards />
    }

    return <UserCards userId={userId} />
}

export default SummaryCards
