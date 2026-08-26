import { useEffect, useState } from 'react'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'

import {
    getRoles,
    deleteRole,
} from '../../api/roles'

import type { Role } from '../../types/role'
import RoleForm from './RoleForm'
import RoleView from './RoleView'
import RoleEdit from './RoleEdit'
import RoleDelete from './RoleDelete'

function Roles() {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showCreate, setShowCreate] = useState(false)
    const [viewRoleId, setViewRoleId] =
        useState<number | null>(null)
    const [editRoleId, setEditRoleId] =
        useState<number | null>(null)
    const [deleteRoleId, setDeleteRoleId] =
        useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)

    const loadRoles = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getRoles()

            setRoles(data)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to load roles.')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRoles()
    }, [])

    const handleDelete = async () => {
        if (deleteRoleId === null) {
            return
        }

        try {
            setDeleting(true)
            setError('')

            await deleteRole(deleteRoleId)

            setDeleteRoleId(null)

            await loadRoles()
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to delete role.')
            }
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="p-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Roles
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage CRM roles.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                    <Plus size={17} />
                    Add Role
                </button>

            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        Loading roles...
                    </div>
                ) : roles.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        No roles found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Role
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Description
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>
                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {roles.map((role) => (
                                    <tr
                                        key={role.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">

                                            <div className="font-medium text-slate-900">
                                                {role.name}
                                            </div>

                                            <div className="mt-1 text-xs text-slate-400">
                                                Role #{role.id}
                                            </div>

                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {role.description || '—'}
                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setViewRoleId(role.id)
                                                    }
                                                    title="View"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditRoleId(role.id)
                                                    }
                                                    title="Edit"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteRoleId(role.id)
                                                    }
                                                    title="Delete"
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {showCreate && (
                <RoleForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false)
                        loadRoles()
                    }}
                />
            )}

            {viewRoleId !== null && (
                <RoleView
                    roleId={viewRoleId}
                    onClose={() => setViewRoleId(null)}
                />
            )}

            {editRoleId !== null && (
                <RoleEdit
                    roleId={editRoleId}
                    onClose={() => setEditRoleId(null)}
                    onSuccess={() => {
                        setEditRoleId(null)
                        loadRoles()
                    }}
                />
            )}

            {deleteRoleId !== null && (
                <RoleDelete
                roleName={
                    roles.find(
                        (role) => role.id === deleteRoleId
                    )?. name ?? 'this role'
                }
                loading={deleting}
                error={error}
                onClose={() => {
                    setDeleteRoleId(null)
                    setError('')
                }}
                onConfirm={handleDelete}
                />
            )}

        </div>
    )
}

export default Roles