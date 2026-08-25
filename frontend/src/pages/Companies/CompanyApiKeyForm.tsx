import { useState } from "react"
import { X, KeyRound, Loader2 } from 'lucide-react'

import { createCompanyApiKey } from "../../api/companies"

interface CompanyApiKeyFormProps {
    companyId: number
    onClose: () => void
    onSuccess: (apiKey: string) => void
}

function CompanyApiKeyForm({
    companyId,
    onClose,
    onSuccess,
}: CompanyApiKeyFormProps) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const getErrorMessage = (error: any, fallback: string) => {
        const detail = error.response?.data?.detail

        if (typeof detail === 'string') {
            return detail
        }

        if (Array.isArray(detail)) {
            const messages = detail
                .map((item) => item?.msg)
                .filter((message): message is string => typeof message === 'string')

            if (messages.length > 0) {
                return messages.join('. ')
            }
        }

        return fallback
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {
            const response = await createCompanyApiKey(
                companyId,
                { name }
            )

            onSuccess(response.api_key)
        } catch (error: any) {
            setError(
                getErrorMessage(error, 'Unable to create API key.')
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <KeyRound size={18} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Create API Key
                            </h2>

                            <p className="text-xs text-slate-500">
                                Generate a new company API key.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="p-6">

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            API Key Name
                            <span className="text-red-500"> *</span>
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                            minLength={2}
                            maxLength={100}
                            placeholder="e.g. Production API"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Give this key a name so you know where it is being used.
                        </p>

                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <Loader2 size={16} className="animate-spin" />
                            )}
                            {loading
                                ? 'Creating...'
                                : 'Create API Key'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default CompanyApiKeyForm