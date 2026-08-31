import {
    countUsers,
    getAttendanceForDate,
    getSessionsForAttendance,
} from '../../api/dashboard'
import type {
    Attendance,
    AttendanceSession,
} from '../../types/attendance'
import { formatDuration, formatTime } from '../Attendance/attendanceFormat'
import { WorkSummaryBadge } from '../Attendance/attendanceStatus'
import { employeeName } from '../../lib/payroll'
import { formatCount, todayKey, utcDateKey } from './dashboardData'
import {
    WidgetCard,
    WidgetEmpty,
    WidgetError,
    WidgetSkeleton,
} from './widgetChrome'
import { useWidget } from './useWidget'

interface Row {
    attendance: Attendance
    sessions: AttendanceSession[]
    firstIn: string | null
    lastOut: string | null
    open: boolean
}

interface SummaryData {
    rows: Row[]
    totalEmployees: number
    present: number
    working: number
    absent: number
}

function AttendanceSummary() {
    const { data, loading, error, reload } = useWidget<SummaryData>(
        async () => {
            const [totalEmployees, primary] = await Promise.all([
                countUsers(),
                getAttendanceForDate(utcDateKey()),
            ])

            const records =
                primary.length > 0
                    ? primary
                    : await getAttendanceForDate(todayKey())

            const rows: Row[] = await Promise.all(
                records.map(async (attendance) => {
                    const sessions = await getSessionsForAttendance(
                        attendance.id,
                    )

                    const sorted = [...sessions].sort((a, b) =>
                        a.punch_in_at.localeCompare(b.punch_in_at),
                    )

                    const open = sessions.some(
                        (session) => session.punch_out_at === null,
                    )

                    const closedOuts = sessions
                        .map((session) => session.punch_out_at)
                        .filter((value): value is string => value !== null)
                        .sort((a, b) => a.localeCompare(b))

                    return {
                        attendance,
                        sessions,
                        firstIn: sorted[0]?.punch_in_at ?? null,
                        lastOut: open
                            ? null
                            : (closedOuts[closedOuts.length - 1] ?? null),
                        open,
                    }
                }),
            )

            const presentUsers = new Set(
                records.map((record) => record.user_id),
            )
            const working = rows.filter((row) => row.open).length

            return {
                rows: rows.sort((a, b) =>
                    employeeName(
                        a.attendance.user,
                        a.attendance.user_id,
                    ).localeCompare(
                        employeeName(
                            b.attendance.user,
                            b.attendance.user_id,
                        ),
                    ),
                ),
                totalEmployees,
                present: presentUsers.size,
                working,
                absent: Math.max(totalEmployees - presentUsers.size, 0),
            }
        },
        [],
    )

    return (
        <WidgetCard title="Attendance Today" bare>
            {loading ? (
                <div className="p-4 sm:p-5">
                    <WidgetSkeleton rows={5} />
                </div>
            ) : error ? (
                <div className="p-4 sm:p-5">
                    <WidgetError onRetry={reload} />
                </div>
            ) : !data ? (
                <div className="p-4 sm:p-5">
                    <WidgetEmpty message="No attendance records" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                        {[
                            {
                                label: 'Present',
                                value: data.present,
                                className: 'text-emerald-600',
                            },
                            {
                                label: 'Working',
                                value: data.working,
                                className: 'text-blue-600',
                            },
                            {
                                label: 'Absent',
                                value: data.absent,
                                className: 'text-red-600',
                            },
                        ].map((chip) => (
                            <div
                                key={chip.label}
                                className="px-4 py-3 text-center sm:px-5"
                            >
                                <p
                                    className={`text-xl font-bold ${chip.className}`}
                                >
                                    {formatCount(chip.value)}
                                </p>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    {chip.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {data.rows.length === 0 ? (
                        <WidgetEmpty message="No one has punched in today" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[34rem] text-left">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">
                                            Employee
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">
                                            Punch In
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">
                                            Punch Out
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">
                                            Total Time
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {data.rows.map((row) => (
                                        <tr key={row.attendance.id}>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800 sm:px-5">
                                                {employeeName(
                                                    row.attendance.user,
                                                    row.attendance.user_id,
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-slate-600 sm:px-5">
                                                {row.firstIn
                                                    ? formatTime(row.firstIn)
                                                    : '—'}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-slate-600 sm:px-5">
                                                {row.open ? (
                                                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                        Active
                                                    </span>
                                                ) : row.lastOut ? (
                                                    formatTime(row.lastOut)
                                                ) : (
                                                    '—'
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-slate-600 sm:px-5">
                                                {formatDuration(
                                                    row.attendance.total_time,
                                                )}
                                            </td>

                                            <td className="px-4 py-3 sm:px-5">
                                                <WorkSummaryBadge
                                                    totalSeconds={
                                                        row.attendance
                                                            .total_time
                                                    }
                                                    sessionCount={
                                                        row.attendance
                                                            .session_count
                                                    }
                                                    hasOpenSession={row.open}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </WidgetCard>
    )
}

export default AttendanceSummary
