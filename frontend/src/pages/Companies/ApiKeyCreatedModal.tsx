import { useState } from "react"
import { Check, CheckCircle2, Copy, X } from "lucide-react"

interface ApiKeyCreatedModalProps {
    apiKey: string
    onClose: () => void
}

function ApiKeyCreatedModal({
    apiKey,
    onClose
}: ApiKeyCreatedModalProps) {
    const [copied, setCopied] = useState(false)
    const [copyError, setCopyError] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey)

            setCopyError(false)
            setCopied(true)

            setTimeout(() => {
                setCopied(false)
            }, 2000)
        } catch {
            setCopyError(true)
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <CheckCircle2 size={20} />
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            API Key Created
                        </h2>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="p-6">

                    <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        <strong>Save this API key now.</strong>
                        {' '}
                        You may not be able to view the full key again.
                    </div>

                    <div className="mt-5">

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            API Key
                        </label>

                        <div className="flex gap-2">

                            <input
                                type="text"
                                value={apiKey}
                                readOnly
                                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-700 outline-none"
                            />

                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                            >
                                {copied ? (
                                    <Check size={16} className="text-green-400" />
                                ) : (
                                    <Copy size={16} />
                                )}

                                {copied
                                    ? 'Copied'
                                    : 'Copy'}
                            </button>

                        </div>

                        {copyError && (
                            <p className="mt-2 text-xs text-red-600">
                                Unable to copy automatically. Please select and copy the key manually.
                            </p>
                        )}

                    </div>

                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        Done
                    </button>

                </div>

            </div>

        </div>
    )
}

export default ApiKeyCreatedModal