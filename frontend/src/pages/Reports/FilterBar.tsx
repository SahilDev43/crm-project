import { Download, RotateCcw } from 'lucide-react'

import type { User } from '../../types/user'
import type { DateRangePreset } from './dateRangePresets'
import { PRESET_LABELS } from './dateRangePresets'

interface FilterBarProps {
    preset: DateRangePreset
    dateFrom: string
    dateTo: string
    employeeId: string
    employees: User[]
    showEmployeeFilter: boolean
    canExport: boolean
    exporting: boolean
    onPresetChange: (preset: DateRangePreset) => void
    onDateFromChange: (value: string) => void
    onDateToChange: (value: string) => void
    onEmployeeChange: (value: string) => void
    onApply: () => void
    onReset: () => void
    onExport: () => void
}

const PRESETS: DateRangePreset[] = [
    'today',
    'this_week',
    'this_month',
    'last_month',
    'this_quarter',
    'this_year',
    'custom',
]

function FilterBar({
    preset,
    dateFrom,
    dateTo,
    employeeId,
    employees,
    showEmployeeFilter,
    canExport,
    exporting,
    onPresetChange,
    onDateFromChange,
    onDateToChange,
    onEmployeeChange,
    onApply,
    onReset,
    onExport,
}: FilterBarProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-500">
                        Date Range
                    </label>
                    <select
                        value={preset}
                        onChange={(event) =>
                            onPresetChange(event.target.value as DateRangePreset)
                        }
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        {PRESETS.map((value) => (
                            <option key={value} value={value}>
                                {PRESET_LABELS[value]}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => onDateFromChange(event.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => onDateToChange(event.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                {showEmployeeFilter && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500">
                            Employee
                        </label>
                        <select
                            value={employeeId}
                            onChange={(event) => onEmployeeChange(event.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">All Employees</option>
                            {employees.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onApply}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>

                {canExport && (
                    <button
                        type="button"
                        onClick={onExport}
                        disabled={exporting}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download size={14} />
                        {exporting ? 'Exporting…' : 'Export CSV'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FilterBar
