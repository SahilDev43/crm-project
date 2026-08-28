import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {
    getMyAttendance,
    getAttendanceSessions,
    punchIn as punchInApi,
    punchOut as punchOutApi,
} from '../../api/attendance'
import { getApiErrorMessage } from '../../api/errors'
import type {
    Attendance,
    AttendanceSession,
} from '../../types/attendance'

import { elapsedSeconds, todayKey, utcDateKey } from './attendanceFormat'

export type WorkState = 'none' | 'working' | 'done'

export interface TodayAttendance {
    today: Attendance | null
    sessions: AttendanceSession[]
    openSession: AttendanceSession | null
    firstPunchIn: string | null
    lastPunchOut: string | null
    state: WorkState
    /** Elapsed seconds of the currently open session, updated every second. */
    runningSeconds: number
    /**
     * Total worked seconds for the day: completed sessions plus the currently
     * open session's live elapsed time.  Punching out and back in continues
     * from this value rather than restarting at zero.
     */
    workedSeconds: number
    loading: boolean
    error: string
    punching: boolean
    reload: () => Promise<void>
    punch: (kind: 'in' | 'out') => Promise<void>
}

/**
 * Loads the current user's attendance for today (via `/attendance/my` plus the
 * session list) and exposes punch in / punch out actions.  A local 1s interval
 * drives `runningSeconds` while a session is open — no per-second API calls.
 */
export function useTodayAttendance(
    onChange?: () => void,
): TodayAttendance {
    const [today, setToday] = useState<Attendance | null>(null)
    const [sessions, setSessions] = useState<AttendanceSession[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [punching, setPunching] = useState(false)
    const [nowMs, setNowMs] = useState(() => Date.now())
    const dayKeyRef = useRef(todayKey())

    const reload = useCallback(async () => {
        try {
            setLoading(true)
            setError('')

            const records = await getMyAttendance()

            dayKeyRef.current = todayKey()

            // `/attendance/my` is ordered newest-first.  Use the latest
            // record rather than matching a date string — the backend keys
            // `attendance_date` off the UTC date, which can differ from the
            // browser's local date.  `state` below decides if it counts as
            // "today".
            const record = records[0] ?? null

            setToday(record)

            if (record) {
                try {
                    setSessions(
                        await getAttendanceSessions(record.id)
                    )
                } catch {
                    setSessions([])
                }
            } else {
                setSessions([])
            }
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to load your attendance.'
                )
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void reload()
    }, [reload])

    const openSession = useMemo(
        () =>
            sessions.find(
                (session) => session.punch_out_at === null
            ) ?? null,
        [sessions]
    )

    useEffect(() => {
        if (!openSession) {
            return
        }

        setNowMs(Date.now())

        const intervalId = window.setInterval(() => {
            setNowMs(Date.now())
        }, 1000)

        return () => window.clearInterval(intervalId)
    }, [openSession])

    // The backend rolls attendance to a fresh record at local midnight; pick
    // that up here so a page left open overnight resets with it.
    useEffect(() => {
        const intervalId = window.setInterval(() => {
            if (todayKey() !== dayKeyRef.current) {
                void reload()
            }
        }, 30_000)

        return () => window.clearInterval(intervalId)
    }, [reload])

    const firstPunchIn = useMemo(() => {
        if (sessions.length === 0) {
            return null
        }

        return [...sessions].sort((a, b) =>
            a.punch_in_at.localeCompare(b.punch_in_at)
        )[0].punch_in_at
    }, [sessions])

    const lastPunchOut = useMemo(() => {
        if (openSession || sessions.length === 0) {
            return null
        }

        const sorted = [...sessions].sort((a, b) =>
            (a.punch_out_at ?? '').localeCompare(
                b.punch_out_at ?? ''
            )
        )

        return sorted[sorted.length - 1].punch_out_at
    }, [openSession, sessions])

    // The latest record counts as "today" if it carries today's date in
    // either the local or the UTC calendar (the backend uses UTC).
    const recordIsToday =
        today !== null &&
        (today.attendance_date === todayKey() ||
            today.attendance_date === utcDateKey())

    const state: WorkState = openSession
        ? 'working'
        : today !== null &&
            sessions.length > 0 &&
            recordIsToday
          ? 'done'
          : 'none'

    const runningSeconds = openSession
        ? elapsedSeconds(openSession.punch_in_at, nowMs)
        : 0

    // `today.total_time` already covers completed sessions; add the live
    // elapsed time of the open session (if any) for a running day total.
    const completedSeconds =
        recordIsToday || openSession ? (today?.total_time ?? 0) : 0
    const workedSeconds = completedSeconds + runningSeconds

    const punch = useCallback(
        async (kind: 'in' | 'out') => {
            try {
                setPunching(true)
                setError('')

                if (kind === 'in') {
                    await punchInApi()
                } else {
                    await punchOutApi()
                }

                await reload()
                onChange?.()
            } catch (err: unknown) {
                setError(
                    getApiErrorMessage(
                        err,
                        `Unable to punch ${kind}.`
                    )
                )
            } finally {
                setPunching(false)
            }
        },
        [reload, onChange]
    )

    return {
        today,
        sessions,
        openSession,
        firstPunchIn,
        lastPunchOut,
        state,
        runningSeconds,
        workedSeconds,
        loading,
        error,
        punching,
        reload,
        punch,
    }
}
