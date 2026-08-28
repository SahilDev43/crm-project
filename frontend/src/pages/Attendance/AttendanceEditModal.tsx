import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Save, X } from 'lucide-react'

import { updateAttendance } from '../../api/attendance'
import { getApiErrorMessage } from '../../api/errors'
import type { Attendance } from '../../types/attendance'

import { formatDate } from './attendanceFormat'

interface AttendanceEditModalProps {
    attendance: Attendance
    onClose: () => void
    onSuccess: () => void | Promise<void>
}

function AttendanceEditModal({
    attendance,
    onClose,
    onSuccess,
}: AttendanceEditModalProps) {
    const [remarks, setRemarks] = useState(
        attendance.remarks ?? ''
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const userName = attendance.user
        ? `${attendance.user.first_name} ${attendance.user.last_name}`.trim()
        : 'Unknown user'

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()
        setError('')

        try {
            setLoading(true)

            await updateAttendance(attendance.id, {
                remarks: remarks.trim() ? remarks.trim() : null,
            })

            await onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to update attendance.'
                )
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
            <div className="mx-auto my-8 w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Edit Attendance
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {userName} ·{' '}
                            {formatDate(attendance.attendance_date)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-400">
                                User
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {userName}
                            </p>

                            {attendance.user?.email && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {attendance.user.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-400">
                                Attendance Date
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {formatDate(
                                    attendance.attendance_date
                                )}
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400">
                        Attendance status (Absent / Half Day / Short Leave
                        / Full Day) is derived automatically from hours
                        worked. Punch-in and punch-out times come from
                        sessions and cannot be edited here.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Remarks
                        </label>

                        <textarea
                            rows={3}
                            value={remarks}
                            onChange={(event) =>
                                setRemarks(event.target.value)
                            }
                            disabled={loading}
                            className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AttendanceEditModal
