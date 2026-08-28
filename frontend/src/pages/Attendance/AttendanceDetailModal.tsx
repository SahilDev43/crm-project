import { useEffect, useMemo, useState } from 'react'
import { Loader2, X } from 'lucide-react'

import { getAttendanceSessions } from '../../api/attendance'
import { getApiErrorMessage } from '../../api/errors'
import type {
    Attendance,
    AttendanceSession,
} from '../../types/attendance'

import {
    formatDate,
    formatDateTime,
    formatDuration,
    formatTime,
} from './attendanceFormat'
import { getWorkSummary } from './attendanceStatus'

interface AttendanceDetailModalProps {
    attendance: Attendance
    onClose: () => void
}

function Info({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
                {value}
            </p>
        </div>
    )
}

function AttendanceDetailModal({
    attendance,
    onClose,
}: AttendanceDetailModalProps) {
    const [sessions, setSessions] = useState<AttendanceSession[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        const load = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getAttendanceSessions(
                    attendance.id
                )

                if (active) {
                    setSessions(data)
                }
            } catch (err: unknown) {
                if (active) {
                    setError(
                        getApiErrorMessage(
                            err,
                            'Unable to load session details.'
                        )
                    )
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void load()

        return () => {
            active = false
        }
    }, [attendance.id])

    const userName = attendance.user
        ? `${attendance.user.first_name} ${attendance.user.last_name}`.trim()
        : 'Unknown user'

    const { firstPunchIn, lastPunchOut, hasOpenSession } = useMemo(() => {
        const open = sessions.some(
            (session) => session.punch_out_at === null
        )

        const sortedIn = [...sessions].sort((a, b) =>
            a.punch_in_at.localeCompare(b.punch_in_at)
        )

        const closedOuts = sessions
            .map((session) => session.punch_out_at)
            .filter((value): value is string => value !== null)
            .sort((a, b) => a.localeCompare(b))

        return {
            firstPunchIn: sortedIn[0]?.punch_in_at ?? null,
            lastPunchOut: open
                ? null
                : (closedOuts[closedOuts.length - 1] ?? null),
            hasOpenSession: open,
        }
    }, [sessions])

    // Prefer the session data once loaded; fall back to the list value.
    const sessionCount = loading
        ? attendance.session_count
        : sessions.length

    const summary = getWorkSummary(
        attendance.total_time,
        sessionCount,
        hasOpenSession
    )

    const isPresent = summary.key !== 'absent'

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
            <div className="mx-auto my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Attendance Details
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {userName} ·{' '}
                            {formatDate(attendance.attendance_date)}
                        </p>

                        {attendance.user?.email && (
                            <p className="text-xs text-slate-400">
                                {attendance.user.email}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    {/* Summary */}
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${summary.className}`}
                        >
                            {summary.label}
                        </span>

                        <span
                            className={`text-sm font-medium ${isPresent ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                            {isPresent ? 'Present' : 'Absent'}
                        </span>

                        <span className="text-sm text-slate-500">
                            {summary.description}
                        </span>
                    </div>

                    {/* Key figures */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <Info
                            label="Punch In"
                            value={
                                firstPunchIn
                                    ? formatTime(firstPunchIn)
                                    : '—'
                            }
                        />

                        <Info
                            label="Punch Out"
                            value={
                                hasOpenSession
                                    ? 'Still active'
                                    : lastPunchOut
                                      ? formatTime(lastPunchOut)
                                      : '—'
                            }
                        />

                        <Info
                            label="Time Spent"
                            value={formatDuration(
                                attendance.total_time
                            )}
                        />

                        <Info
                            label="Sessions"
                            value={String(sessionCount)}
                        />

                        <Info
                            label="Remarks"
                            value={attendance.remarks || '—'}
                        />
                    </div>

                    {/* Sessions */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">
                            Punch Sessions
                        </h3>

                        {loading ? (
                            <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                                Loading sessions...
                            </div>
                        ) : error ? (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                                No punch sessions for this day.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Punch In
                                            </th>

                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Punch Out
                                            </th>

                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Duration
                                            </th>

                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                                Auto Closed
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {sessions.map((session) => (
                                            <tr key={session.id}>
                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {formatDateTime(
                                                        session.punch_in_at
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-sm">
                                                    {session.punch_out_at ? (
                                                        <span className="text-slate-700">
                                                            {formatDateTime(
                                                                session.punch_out_at
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                            Currently Active
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {formatDuration(
                                                        session.total_time
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {session.auto_closed
                                                        ? 'Yes'
                                                        : 'No'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AttendanceDetailModal
