import type { ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface WidgetCardProps {
    title: string
    action?: ReactNode
    /** Render with the card's own padding removed (e.g. for full-bleed tables). */
    bare?: boolean
    className?: string
    children: ReactNode
}

export function WidgetCard({
    title,
    action,
    bare = false,
    className = '',
    children,
}: WidgetCardProps) {
    return (
        <section
            className={`flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
        >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
                <h2 className="text-sm font-semibold text-slate-900">
                    {title}
                </h2>
                {action}
            </div>

            <div className={bare ? 'flex-1' : 'flex-1 p-4 sm:p-5'}>
                {children}
            </div>
        </section>
    )
}

export function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-3">
            {Array.from({ length: rows }, (_, index) => (
                <div
                    key={index}
                    className="h-4 rounded bg-slate-100"
                    style={{ width: `${90 - index * 12}%` }}
                />
            ))}
        </div>
    )
}

export function WidgetError({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-start gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-2 text-red-600">
                <AlertCircle size={15} />
                Unable to load this section.
            </span>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    <RefreshCw size={13} />
                    Retry
                </button>
            )}
        </div>
    )
}

export function WidgetEmpty({ message }: { message: string }) {
    return (
        <p className="py-4 text-center text-sm text-slate-400">{message}</p>
    )
}
