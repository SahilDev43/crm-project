import { useState } from 'react'
import { X } from 'lucide-react'

import { createSalaryComponent } from '../../api/salaryComponents'
import { getApiErrorMessage } from '../../api/errors'
import { COMPONENT_TYPE, COMPONENT_TYPE_OPTIONS } from '../../lib/payroll'

interface SalaryComponentFormProps {
    onClose: () => void
    onSuccess: () => void
}

function SalaryComponentForm({
    onClose,
    onSuccess,
}: SalaryComponentFormProps) {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [componentType, setComponentType] = useState<number>(
        COMPONENT_TYPE.EARNING,
    )
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

            await createSalaryComponent({
                name: name.trim(),
                code: code.trim(),
                component_type: componentType,
                description: description.trim() || null,
                is_active: isActive,
            })

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to create salary component.',
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
                            Create Salary Component
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Define an earning or deduction building block.
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
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                placeholder="e.g. House Rent Allowance"
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
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-red-500"
                                placeholder="e.g. HRA"
                            />

                            <p className="mt-1 text-xs text-slate-400">
                                Stored in uppercase and must be unique.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Type *
                            </label>

                            <select
                                value={componentType}
                                onChange={(event) =>
                                    setComponentType(
                                        Number(event.target.value),
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                            >
                                {COMPONENT_TYPE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
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
                            {loading ? 'Creating...' : 'Create Component'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default SalaryComponentForm
