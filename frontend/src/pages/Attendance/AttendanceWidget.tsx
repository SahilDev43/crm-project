import { LogIn, LogOut, Loader2, RefreshCw } from 'lucide-react'

import {
    formatDuration,
    formatStopwatch,
    formatTime,
} from './attendanceFormat'
import { useTodayAttendance } from './useTodayAttendance'

interface AttendanceWidgetProps {
    /** Called after a successful punch in / punch out. */
    onChange?: () => void
    className?: string
}

function Stat({
    label,
    value,
    accent,
}: {
    label: string
    value: string
    accent?: boolean
}) {
    return (
        <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p
                className={`mt-1 text-sm font-semibold ${accent ? 'text-emerald-600' : 'text-slate-900'}`}
            >
                {value}
            </p>
        </div>
    )
}

function AttendanceWidget({
    onChange,
    className,
}: AttendanceWidgetProps) {
    const {
        sessions,
        openSession,
        firstPunchIn,
        lastPunchOut,
        state,
        workedSeconds,
        loading,
        error,
        punching,
        reload,
        punch,
    } = useTodayAttendance(onChange)

    const isWorking = state === 'working'
    const isDone = state === 'done'

    const longDate = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })

    const dotColor = isWorking
        ? 'bg-emerald-500'
        : isDone
          ? 'bg-slate-400'
          : 'bg-red-500'

    const badgeText = isWorking
        ? 'Working'
        : isDone
          ? 'Completed'
          : 'Not started'

    const badgeClass = isWorking
        ? 'bg-emerald-100 text-emerald-700'
        : isDone
          ? 'bg-slate-100 text-slate-600'
          : 'bg-red-100 text-red-700'

    return (
        <section
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className ?? ''}`}
        >
            {/* Status band */}
            <div
                className={`flex flex-wrap items-center justify-between gap-2 border-b px-6 py-3.5 transition-colors ${
                    isWorking
                        ? 'border-emerald-100 bg-emerald-50/70'
                        : 'border-slate-100 bg-slate-50/70'
                }`}
            >
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        {isWorking && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        )}

                        <span
                            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotColor}`}
                        />
                    </span>

                    <h2 className="text-sm font-semibold text-slate-900">
                        Attendance Today
                    </h2>

                    {!loading && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}
                        >
                            {badgeText}
                        </span>
                    )}
                </div>

                <span className="text-xs font-medium text-slate-500">
                    {longDate}
                </span>
            </div>

            {/* Body */}
            <div className="p-6">
                {loading ? (
                    <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-3">
                            <div className="h-3 w-24 rounded bg-slate-200" />
                            <div className="h-12 w-56 rounded bg-slate-200" />
                            <div className="h-3 w-40 rounded bg-slate-200" />
                        </div>

                        <div className="h-11 w-36 rounded-lg bg-slate-200" />
                    </div>
                ) : error ? (
                    <div className="space-y-3">
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                void reload()
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <RefreshCw size={15} />
                            Try again
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                {isWorking || isDone
                                    ? 'Worked today'
                                    : 'Status'}
                            </p>

                            {state === 'none' ? (
                                <p className="mt-1.5 text-2xl font-bold text-slate-900">
                                    Not punched in
                                </p>
                            ) : (
                                <p
                                    className={`mt-1 font-mono text-5xl font-bold tabular-nums tracking-tight ${
                                        isWorking
                                            ? 'text-emerald-600'
                                            : 'text-slate-900'
                                    }`}
                                >
                                    {formatStopwatch(workedSeconds)}
                                </p>
                            )}

                            <p className="mt-2 text-sm text-slate-500">
                                {state === 'none' &&
                                    'Start your day by punching in.'}

                                {isWorking &&
                                    firstPunchIn &&
                                    `Punched in at ${formatTime(firstPunchIn)}`}

                                {isDone &&
                                    firstPunchIn &&
                                    lastPunchOut &&
                                    `${formatTime(firstPunchIn)} — ${formatTime(lastPunchOut)}`}
                            </p>
                        </div>

                        <div className="shrink-0">
                            {openSession ? (
                                <button
                                    type="button"
                                    onClick={() => punch('out')}
                                    disabled={punching}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                                >
                                    {punching ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <LogOut size={16} />
                                    )}

                                    {punching
                                        ? 'Punching Out...'
                                        : 'Punch Out'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => punch('in')}
                                    disabled={punching}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                                >
                                    {punching ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <LogIn size={16} />
                                    )}

                                    {punching
                                        ? 'Punching In...'
                                        : 'Punch In'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Stat strip */}
            {!loading && !error && state !== 'none' && (
                <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-4 sm:divide-y-0">
                    <Stat
                        label="Punch In"
                        value={
                            firstPunchIn
                                ? formatTime(firstPunchIn)
                                : '—'
                        }
                    />

                    <Stat
                        label="Punch Out"
                        value={
                            openSession
                                ? 'Active'
                                : lastPunchOut
                                  ? formatTime(lastPunchOut)
                                  : '—'
                        }
                        accent={Boolean(openSession)}
                    />

                    <Stat
                        label="Total Time"
                        value={formatDuration(workedSeconds)}
                    />

                    <Stat
                        label="Sessions"
                        value={String(sessions.length)}
                    />
                </div>
            )}
        </section>
    )
}

export default AttendanceWidget
