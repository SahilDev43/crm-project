import axios from 'axios'

/**
 * Pull a human-readable message out of an unknown error thrown by an API
 * call.  FastAPI returns `{ detail: string }` for handled errors and
 * `{ detail: [{ msg, ... }] }` for request-validation errors; anything else
 * falls back to the supplied message so the UI is never left blank.
 */
export const getApiErrorMessage = (
    error: unknown,
    fallback: string,
): string => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
        const detail = error.response?.data?.detail

        if (typeof detail === 'string') {
            return detail
        }

        if (Array.isArray(detail) && detail.length > 0) {
            const first = detail[0]

            if (
                first &&
                typeof first === 'object' &&
                'msg' in first &&
                typeof (first as { msg: unknown }).msg === 'string'
            ) {
                return (first as { msg: string }).msg
            }
        }
    }

    return fallback
}
