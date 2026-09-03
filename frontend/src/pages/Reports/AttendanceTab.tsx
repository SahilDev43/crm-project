import { CalendarCheck, CalendarX, Clock, Timer } from 'lucide-react'

import { useAuth } from '../../auth/AuthContext'
import { getAttendanceReport, getAttendanceUserReport } from '../../api/reports'
import StatCard from '../Dashboard/StatCard'
import { WidgetCard, WidgetEmpty, WidgetError, WidgetSkeleton } from '../Dashboard/widgetChrome'
import { useWidget } from '../Dashboard/useWidget'
import { formatMinutesAsHours } from './reportFormat'

interface TabFilters {
    dateFrom: string
    dateTo: string
    employeeId: number | null
}

function AttendanceTab({ dateFrom, dateTo, employeeId }: TabFilters) {
    const { hasPermission } = useAuth()
    const canSeeCompanyWide = hasPermission('reports.attendance')

    const summaryParams = { date_from: dateFrom, date_to: dateTo, user_id: employeeId ?? undefined }
    const summary = useWidget(
        () => getAttendanceReport(summaryParams),
        [dateFrom, dateTo, employeeId],
    )

    const byEmployee = useWidget(
        () => getAttendanceUserReport({ date_from: dateFrom, date_to: dateTo, page: 1, page_size: 20 }),
        canSeeCompanyWide ? [dateFrom, dateTo] : [],
    )

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                    label="Present Days"
                    value={summary.data?.present_days ?? null}
                    icon={CalendarCheck}
                    tone="green"
                    loading={summary.loading}
                    error={!!summary.error}
                />
                <StatCard
                    label="Absent Days"
                    value={summary.data?.absent_days ?? null}
                    icon={CalendarX}
                    tone="red"
                    loading={summary.loading}
                    error={!!summary.error}
                />
                <StatCard
                    label="Late Days"
                    value={summary.data?.late_days ?? null}
                    icon={Clock}
                    tone="amber"
                    loading={summary.loading}
                    error={!!summary.error}
                />
                <StatCard
                    label="Avg. Working Time"
                    value={summary.data ? Math.round(summary.data.average_working_time) : null}
                    icon={Timer}
                    tone="blue"
                    loading={summary.loading}
                    error={!!summary.error}
                    hint={summary.data ? formatMinutesAsHours(summary.data.average_working_time) : undefined}
                />
            </div>

            {canSeeCompanyWide && (
                <WidgetCard title="Employee Attendance">
                    {byEmployee.loading ? (
                        <WidgetSkeleton rows={5} />
                    ) : byEmployee.error ? (
                        <WidgetError onRetry={byEmployee.reload} />
                    ) : !byEmployee.data || byEmployee.data.items.length === 0 ? (
                        <WidgetEmpty message="No data available for this period." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-medium uppercase text-slate-400">
                                        <th className="pb-2">Employee</th>
                                        <th className="pb-2 text-right">Present</th>
                                        <th className="pb-2 text-right">Absent</th>
                                        <th className="pb-2 text-right">Late</th>
                                        <th className="pb-2 text-right">Working Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {byEmployee.data.items.map((row) => (
                                        <tr key={row.user_id}>
                                            <td className="py-2 text-slate-700">{row.user_name}</td>
                                            <td className="py-2 text-right text-emerald-600">{row.present_days}</td>
                                            <td className="py-2 text-right text-red-600">{row.absent_days}</td>
                                            <td className="py-2 text-right text-amber-600">{row.late_days}</td>
                                            <td className="py-2 text-right text-slate-900">
                                                {formatMinutesAsHours(row.total_working_time)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </WidgetCard>
            )}
        </div>
    )
}

export default AttendanceTab
