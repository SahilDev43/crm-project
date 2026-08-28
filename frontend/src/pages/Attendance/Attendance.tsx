import {
    useCallback,
    useEffect,
    useState,
} from 'react'
import { Eye, Loader2, Pencil, RotateCcw, Search } from 'lucide-react'

import {
    getAttendance,
    getAttendanceSessions,
} from '../../api/attendance'
import { getUsers } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import type {
    Attendance as AttendanceRecord,
    AttendanceSession,
} from '../../types/attendance'
import type { User } from '../../types/user'

import { formatDate, formatDuration, formatTime } from './attendanceFormat'
import { WorkSummaryBadge } from './attendanceStatus'
import AttendanceDetailModal from './AttendanceDetailModal'
import AttendanceEditModal from './AttendanceEditModal'

const PAGE_SIZE = 10

type SessionsMap = Record<number, AttendanceSession[]>

interface RowTimes {
    firstPunchIn: string | null
    lastPunchOut: string | null
    hasOpenSession: boolean
}

const deriveRowTimes = (
    sessions: AttendanceSession[] | undefined
): RowTimes | null => {
    if (sessions === undefined) {
        return null
    }

    if (sessions.length === 0) {
        return {
            firstPunchIn: null,
            lastPunchOut: null,
            hasOpenSession: false,
        }
    }

    const byPunchIn = [...sessions].sort((a, b) =>
        a.punch_in_at.localeCompare(b.punch_in_at)
    )

    const hasOpenSession = sessions.some(
        (session) => session.punch_out_at === null
    )

    let lastPunchOut: string | null = null

    if (!hasOpenSession) {
        const closed = sessions
            .map((session) => session.punch_out_at)
            .filter((value): value is string => value !== null)
            .sort((a, b) => a.localeCompare(b))

        lastPunchOut = closed[closed.length - 1] ?? null
    }

    return {
        firstPunchIn: byPunchIn[0].punch_in_at,
        lastPunchOut,
        hasOpenSession,
    }
}

function Attendance() {
    const [items, setItems] = useState<AttendanceRecord[]>([])
    const [sessionsMap, setSessionsMap] = useState<SessionsMap>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const [users, setUsers] = useState<User[]>([])
    const [userFilter, setUserFilter] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')

    const [detailFor, setDetailFor] =
        useState<AttendanceRecord | null>(null)
    const [editFor, setEditFor] =
        useState<AttendanceRecord | null>(null)

    const loadAttendance = useCallback(async () => {
        try {
            setLoading(true)
            setError('')

            const response = await getAttendance({
                page,
                page_size: PAGE_SIZE,
                user_id: userFilter ? Number(userFilter) : undefined,
                attendance_date: dateFilter || undefined,
                search: search || undefined,
            })

            setItems(response.items)
            setTotalPages(response.total_pages || 1)
            setTotal(response.total)

            const entries = await Promise.all(
                response.items.map(async (record) => {
                    try {
                        return [
                            record.id,
                            await getAttendanceSessions(record.id),
                        ] as const
                    } catch {
                        return [
                            record.id,
                            [] as AttendanceSession[],
                        ] as const
                    }
                })
            )

            setSessionsMap(Object.fromEntries(entries))
        } catch (err: unknown) {
            setItems([])
            setSessionsMap({})
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to load attendance records.'
                )
            )
        } finally {
            setLoading(false)
        }
    }, [page, userFilter, dateFilter, search])

    useEffect(() => {
        void loadAttendance()
    }, [loadAttendance])

    // Debounce the search box so we hit the API once the user pauses typing.
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setSearch((current) => {
                const next = searchInput.trim()

                if (next !== current) {
                    setPage(1)
                }

                return next
            })
        }, 400)

        return () => window.clearTimeout(timeoutId)
    }, [searchInput])

    useEffect(() => {
        let active = true

        getUsers({ page: 1, page_size: 100 })
            .then((response) => {
                if (active) {
                    setUsers(response.items)
                }
            })
            .catch(() => {
                if (active) {
                    setUsers([])
                }
            })

        return () => {
            active = false
        }
    }, [])

    const resetToFirstPage = () => setPage(1)

    const clearFilters = () => {
        setUserFilter('')
        setDateFilter('')
        setSearchInput('')
        setSearch('')
        setPage(1)
    }

    const hasFilters =
        userFilter !== '' ||
        dateFilter !== '' ||
        searchInput !== ''

    return (
        <div className="p-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Attendance
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Review attendance and working hours for all users.
                </p>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="min-w-[16rem] flex-[2]">
                    <label className="block text-xs font-medium uppercase text-slate-400">
                        Search
                    </label>

                    <div className="relative mt-1.5">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Search by name or email"
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                <div className="min-w-[12rem] flex-1">
                    <label className="block text-xs font-medium uppercase text-slate-400">
                        User
                    </label>

                    <select
                        value={userFilter}
                        onChange={(event) => {
                            setUserFilter(event.target.value)
                            resetToFirstPage()
                        }}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    >
                        <option value="">All users</option>

                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[10rem] flex-1">
                    <label className="block text-xs font-medium uppercase text-slate-400">
                        Date
                    </label>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(event) => {
                            setDateFilter(event.target.value)
                            resetToFirstPage()
                        }}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                    />
                </div>

                <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasFilters}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <RotateCcw size={15} />
                    Clear
                </button>
            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <p className="mt-6 text-sm text-slate-500">
                    {total === 0
                        ? 'No records'
                        : `${total} record${total === 1 ? '' : 's'}`}
                    {total > 0 && totalPages > 1
                        ? ` · page ${page} of ${totalPages}`
                        : ''}
                </p>
            )}

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading attendance...
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        User
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Attendance
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Punch In
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Punch Out
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Total Time
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Sessions
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Remarks
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {items.map((record) => {
                                    const times = deriveRowTimes(
                                        sessionsMap[record.id]
                                    )

                                    const userName = record.user
                                        ? `${record.user.first_name} ${record.user.last_name}`.trim()
                                        : '—'

                                    return (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {formatDate(
                                                    record.attendance_date
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {userName}
                                                </p>

                                                {record.user?.email && (
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {record.user.email}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {times === null ? (
                                                    <span className="text-slate-300">
                                                        …
                                                    </span>
                                                ) : (
                                                    <WorkSummaryBadge
                                                        totalSeconds={
                                                            record.total_time
                                                        }
                                                        sessionCount={
                                                            record.session_count
                                                        }
                                                        hasOpenSession={
                                                            times.hasOpenSession
                                                        }
                                                    />
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {times === null ? (
                                                    <span className="text-slate-300">
                                                        …
                                                    </span>
                                                ) : times.firstPunchIn ? (
                                                    formatTime(
                                                        times.firstPunchIn
                                                    )
                                                ) : (
                                                    '—'
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {times === null ? (
                                                    <span className="text-slate-300">
                                                        …
                                                    </span>
                                                ) : times.hasOpenSession ? (
                                                    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                        Active
                                                    </span>
                                                ) : times.lastPunchOut ? (
                                                    formatTime(
                                                        times.lastPunchOut
                                                    )
                                                ) : (
                                                    '—'
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-sm font-medium text-slate-800">
                                                {formatDuration(
                                                    record.total_time
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {record.session_count > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetailFor(
                                                                record
                                                            )
                                                        }
                                                        className="font-medium text-red-600 hover:text-red-700"
                                                    >
                                                        {record.session_count}
                                                    </button>
                                                ) : (
                                                    '0'
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                <span className="line-clamp-2 max-w-[16rem]">
                                                    {record.remarks || '—'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        title="View details"
                                                        onClick={() =>
                                                            setDetailFor(
                                                                record
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Edit attendance"
                                                        onClick={() =>
                                                            setEditFor(record)
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() =>
                            setPage((current) => current - 1)
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-slate-500">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((current) => current + 1)
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            {detailFor && (
                <AttendanceDetailModal
                    attendance={detailFor}
                    onClose={() => setDetailFor(null)}
                />
            )}

            {editFor && (
                <AttendanceEditModal
                    attendance={editFor}
                    onClose={() => setEditFor(null)}
                    onSuccess={async () => {
                        setEditFor(null)
                        await loadAttendance()
                    }}
                />
            )}
        </div>
    )
}

export default Attendance
