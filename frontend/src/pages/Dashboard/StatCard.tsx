import type { LucideIcon } from 'lucide-react'

import { formatCount } from './dashboardData'

export type StatTone = 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'slate'

const TONES: Record<StatTone, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
}

export interface StatCardProps {
    label: string
    value: number | null
    icon: LucideIcon
    tone?: StatTone
    loading?: boolean
    error?: boolean
    /** Small caption under the number (e.g. "of 42 employees"). No fake trends. */
    hint?: string
}

function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'slate',
    loading = false,
    error = false,
    hint,
}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${TONES[tone]}`}
                >
                    <Icon size={20} />
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                        {label}
                    </p>

                    {loading ? (
                        <div className="mt-2 h-6 w-16 animate-pulse rounded bg-slate-100" />
                    ) : error ? (
                        <p className="mt-1 text-sm font-medium text-red-500">
                            Unavailable
                        </p>
                    ) : (
                        <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                            {value === null ? '—' : formatCount(value)}
                        </p>
                    )}

                    {hint && !loading && !error && (
                        <p className="mt-1 text-xs text-slate-400">{hint}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StatCard
