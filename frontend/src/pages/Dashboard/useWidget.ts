import { useCallback, useEffect, useState } from 'react'

/**
 * Per-widget async state.  Each dashboard widget loads independently so one
 * failing endpoint never blanks the whole dashboard.
 */
export interface WidgetState<T> {
    data: T | null
    loading: boolean
    error: string
    reload: () => void
}

export function useWidget<T>(
    loader: () => Promise<T>,
    deps: unknown[],
): WidgetState<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [nonce, setNonce] = useState(0)

    const reload = useCallback(() => setNonce((value) => value + 1), [])

    useEffect(() => {
        let active = true

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        setError('')

        loader()
            .then((result) => {
                if (active) {
                    setData(result)
                }
            })
            .catch(() => {
                if (active) {
                    setError('Unable to load this section.')
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, nonce])

    return { data, loading, error, reload }
}
