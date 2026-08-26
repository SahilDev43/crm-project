import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { getRole, updateRole } from '../../api/roles'
import type { Role, RoleUpdate } from '../../types/role'

interface RoleEditProps {
    roleId: number,
    onClose: () => void,
    onSuccess: () => void
}

function RoleEdit({
    roleId,
    onClose,
    onSuccess
}: RoleEditProps) {
    const [role, setRole] = useState<Role | null>(null)
    const [form, setForm] = useState<RoleUpdate>({
        name: '',
        description: '',
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadRole = async () => {
            try {
                setLoading(true)
                setError('')

                const data = await getRole(roleId)

                setRole(data)

                setForm({
                    name: data.name,
                    description: data.description ?? '',
                })
            } catch (error: any) {
                if (error.response?.data?.detail) {
                    setError(error.response.data.detail)
                } else {
                    setError('Unable to load role.')
                }
            } finally {
                setLoading(false)
            }
        }

        loadRole()
    }, [roleId])

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: value
        }))
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError('')

        if (!form.name?.trim()) {
            setError("Role name is required")
            return
        }
        try {
            setSaving(true)

            await updateRole(roleId, {
                name: form.name.trim(),
                description:
                    form.description?.trim() || null,
            })

            onSuccess()
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to update role.')
            }
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
                            Edit Role
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Update role information.
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
                                Loading role...
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                {role && (
                                    <div className="mb-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                        Editing role #{role.id}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Role Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name ?? ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                        placeholder="e.g. Sales Manager"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={form.description ?? ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                        placeholder="Describe this role..."
                                    />
                                </div>
                            </>
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

export default RoleEdit