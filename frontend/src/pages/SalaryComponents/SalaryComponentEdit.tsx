import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import {
    getSalaryComponent,
    updateSalaryComponent,
} from '../../api/salaryComponents'
import { getApiErrorMessage } from '../../api/errors'
import { COMPONENT_TYPE_OPTIONS } from '../../lib/payroll'

interface SalaryComponentEditProps {
    componentId: number
    onClose: () => void
    onSuccess: () => void
}

function SalaryComponentEdit({
    componentId,
    onClose,
    onSuccess,
}: SalaryComponentEditProps) {
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [componentType, setComponentType] = useState<number>(1)
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadComponent = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getSalaryComponent(componentId)

                setName(data.name)
                setCode(data.code)
                setComponentType(data.component_type)
                setDescription(data.description ?? '')
                setIsActive(data.is_active)
            } catch (err: unknown) {
                setError(
                    getApiErrorMessage(
                        err,
                        'Unable to load salary component.',
                    ),
                )
            } finally {
                setLoading(false)
            }
        }

        void loadComponent()
    }, [componentId])

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
            setSaving(true)

            await updateSalaryComponent(componentId, {
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
                    'Unable to update salary component.',
                ),
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Edit Salary Component
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Update salary component information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="p-6">

                        {loading ? (
                            <div className="py-10 text-center text-sm text-slate-500">
                                Loading salary component...
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {error && (
                                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                    Editing component #{componentId}
                                </div>

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
                                    />
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
                                        {COMPONENT_TYPE_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ),
                                        )}
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
                        )}

                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || saving}
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default SalaryComponentEdit
