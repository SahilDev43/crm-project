import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'

import { useAuth } from '../../auth/AuthContext'
import { exportReport } from '../../api/reports'
import { getUsers } from '../../api/users'
import type { User } from '../../types/user'
import type { ExportReportType } from '../../types/report'
import FilterBar from './FilterBar'
import { resolvePreset, type DateRangePreset } from './dateRangePresets'
import SalesTab from './SalesTab'
import RevenueTab from './RevenueTab'
import AttendanceTab from './AttendanceTab'
import PayrollTab from './PayrollTab'
import PerformanceTab from './PerformanceTab'

type TabKey = 'sales' | 'revenue' | 'attendance' | 'payroll' | 'performance'

const DEFAULT_RANGE = resolvePreset('this_month')!

function Reports() {
    const { hasPermission } = useAuth()

    const [preset, setPreset] = useState<DateRangePreset>('this_month')
    const [pendingDateFrom, setPendingDateFrom] = useState(DEFAULT_RANGE.dateFrom)
    const [pendingDateTo, setPendingDateTo] = useState(DEFAULT_RANGE.dateTo)
    const [pendingEmployeeId, setPendingEmployeeId] = useState('')

    const [dateFrom, setDateFrom] = useState(DEFAULT_RANGE.dateFrom)
    const [dateTo, setDateTo] = useState(DEFAULT_RANGE.dateTo)
    const [employeeId, setEmployeeId] = useState<number | null>(null)

    const [employees, setEmployees] = useState<User[]>([])
    const [exporting, setExporting] = useState(false)

    const canSeeUsers = hasPermission('users.view')

    useEffect(() => {
        if (!canSeeUsers) {
            return
        }

        getUsers({ page_size: 100 })
            .then((response) => setEmployees(response.items))
            .catch(() => setEmployees([]))
    }, [canSeeUsers])

    const tabs: Array<{ key: TabKey; label: string; visible: boolean }> = [
        { key: 'sales', label: 'Sales', visible: true },
        { key: 'revenue', label: 'Revenue', visible: hasPermission('reports.revenue') },
        { key: 'attendance', label: 'Attendance', visible: true },
        { key: 'payroll', label: 'Payroll', visible: hasPermission('reports.payroll') },
        { key: 'performance', label: 'Performance', visible: hasPermission('reports.performance') },
    ]
    const visibleTabs = tabs.filter((tab) => tab.visible)

    const [activeTab, setActiveTab] = useState<TabKey>('sales')

    useEffect(() => {
        if (!visibleTabs.some((tab) => tab.key === activeTab)) {
            setActiveTab(visibleTabs[0]?.key ?? 'sales')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleTabs.map((t) => t.key).join(',')])

    const handlePresetChange = (value: DateRangePreset) => {
        setPreset(value)
        const range = resolvePreset(value)
        if (range) {
            setPendingDateFrom(range.dateFrom)
            setPendingDateTo(range.dateTo)
            setDateFrom(range.dateFrom)
            setDateTo(range.dateTo)
        }
    }

    const handleApply = () => {
        setDateFrom(pendingDateFrom)
        setDateTo(pendingDateTo)
        setEmployeeId(pendingEmployeeId ? Number(pendingEmployeeId) : null)
    }

    const handleReset = () => {
        setPreset('this_month')
        setPendingDateFrom(DEFAULT_RANGE.dateFrom)
        setPendingDateTo(DEFAULT_RANGE.dateTo)
        setPendingEmployeeId('')
        setDateFrom(DEFAULT_RANGE.dateFrom)
        setDateTo(DEFAULT_RANGE.dateTo)
        setEmployeeId(null)
    }

    const exportPermissionForTab: Record<TabKey, string> = {
        sales: 'reports.view',
        revenue: 'reports.revenue',
        attendance: 'reports.view',
        payroll: 'reports.payroll',
        performance: 'reports.performance',
    }

    const exportTypeForTab: Record<TabKey, ExportReportType> = {
        sales: 'sales',
        revenue: 'revenue',
        attendance: 'attendance',
        payroll: 'payroll',
        performance: 'performance',
    }

    const canExport =
        hasPermission('reports.export') && hasPermission(exportPermissionForTab[activeTab])

    const handleExport = async () => {
        setExporting(true)
        try {
            await exportReport(exportTypeForTab[activeTab], {
                date_from: dateFrom,
                date_to: dateTo,
                user_id: employeeId ?? undefined,
                month: new Date(dateTo).getMonth() + 1,
                year: new Date(dateTo).getFullYear(),
            })
        } catch {
            // Export failures are non-critical; the report data itself is still visible on screen.
        } finally {
            setExporting(false)
        }
    }

    const showEmployeeFilter = activeTab !== 'revenue'

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BarChart3 size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
                    <p className="text-sm text-slate-500">
                        Company performance across sales, revenue, attendance and payroll.
                    </p>
                </div>
            </div>

            <FilterBar
                preset={preset}
                dateFrom={pendingDateFrom}
                dateTo={pendingDateTo}
                employeeId={pendingEmployeeId}
                employees={employees}
                showEmployeeFilter={showEmployeeFilter && employees.length > 0}
                canExport={canExport}
                exporting={exporting}
                onPresetChange={handlePresetChange}
                onDateFromChange={(value) => {
                    setPreset('custom')
                    setPendingDateFrom(value)
                }}
                onDateToChange={(value) => {
                    setPreset('custom')
                    setPendingDateTo(value)
                }}
                onEmployeeChange={setPendingEmployeeId}
                onApply={handleApply}
                onReset={handleReset}
                onExport={handleExport}
            />

            <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                            activeTab === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'sales' && (
                <SalesTab dateFrom={dateFrom} dateTo={dateTo} employeeId={employeeId} />
            )}
            {activeTab === 'revenue' && hasPermission('reports.revenue') && (
                <RevenueTab dateFrom={dateFrom} dateTo={dateTo} />
            )}
            {activeTab === 'attendance' && (
                <AttendanceTab dateFrom={dateFrom} dateTo={dateTo} employeeId={employeeId} />
            )}
            {activeTab === 'payroll' && hasPermission('reports.payroll') && (
                <PayrollTab employeeId={employeeId} />
            )}
            {activeTab === 'performance' && hasPermission('reports.performance') && (
                <PerformanceTab dateFrom={dateFrom} dateTo={dateTo} employeeId={employeeId} />
            )}
        </div>
    )
}

export default Reports
