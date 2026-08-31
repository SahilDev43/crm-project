import { useState } from 'react'
import { X } from 'lucide-react'

import { createSalaryStructure } from '../../api/salaryStructures'
import { getApiErrorMessage } from '../../api/errors'

interface SalaryStructureFormProps {
    onClose: () => void
    onSuccess: () => void
}

function SalaryStructureForm({
    onClose,
    onSuccess,
}: SalaryStructureFormProps) {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')

        if (!name.trim()) {
            setError('Name is required.')
            return
        }

        if (!code.trim()) {
            setError('Code is required.')
            return
        }

        try {
            setLoading(true)

            await createSalaryStructure({
                name: name.trim(),
                code: code.trim(),
                description: description.trim() || null,
                is_active: isActive,
            })

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to create salary structure.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Create Salary Structure
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Add components to it after creating.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="space-y-4 p-6">

                        {error && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Name *
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                                maxLength={150}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                placeholder="e.g. Standard Full-Time"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Code *
                            </label>

                            <input
                                type="text"
                                value={code}
                                onChange={(event) =>
                                    setCode(event.target.value)
                                }
                                required
                                maxLength={50}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-red-500"
                                placeholder="e.g. STD-FT"
                            />

                            <p className="mt-1 text-xs text-slate-400">
                                Stored in uppercase and unique per company.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                placeholder="Optional description..."
                            />
                        </div>

                        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) =>
                                    setIsActive(event.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            Active
                        </label>

                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Structure'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default SalaryStructureForm
