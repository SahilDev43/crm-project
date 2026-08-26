import { useEffect, useState } from 'react'
import {
    Plus,
    Eye,
    Pencil,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

import { getPermissions, deletePermission } from '../../api/permissions'

import type { Permission } from '../../types/permission'
import PermissionForm from './PermissionForm'
import PermissionView from './PermissionView'
import PermissionEdit from './PermissionEdit'
import PermissionDelete from './PermissionDelete'

const PAGE_SIZE = 10

function Permissions() {
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [showCreate, setShowCreate] = useState(false)
    const [viewPermissionId, setViewPermissionId] =
        useState<number | null>(null)
    const [editPermissionId, setEditPermissionId] =
        useState<number | null>(null)
    const [deletePermissionId, setDeletePermissionId] =
        useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim())
            setPage(1)
        }, 400)

        return () => clearTimeout(timeout)
    }, [search])

    const loadPermissions = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getPermissions({
                search: debouncedSearch || undefined,
                page,
                page_size: PAGE_SIZE,
            })

            if (data.items.length === 0 && page > 1 && data.total_pages > 0) {
                setPage(data.total_pages)
                return
            }

            setPermissions(data.items)
            setTotal(data.total)
            setTotalPages(data.total_pages)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to load permissions.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (deletePermissionId === null) {
            return
        }

        try {
            setDeleting(true)
            setError('')

            await deletePermission(deletePermissionId)

            setDeletePermissionId(null)

            await loadPermissions()
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to delete permission.')
            }
        } finally {
            setDeleting(false)
        }
    }

    useEffect(() => {
        loadPermissions()
    }, [debouncedSearch, page])

    return (
        <div className="p-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Permissions
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage CRM permissions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                    <Plus size={17} />
                    Add Permission
                </button>

            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="relative mt-6 max-w-sm">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search permissions..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500"
                />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        Loading permissions...
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        {debouncedSearch
                            ? `No permissions match "${debouncedSearch}".`
                            : 'No permissions found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Permission
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

                                {permissions.map((permission) => (
                                    <tr
                                        key={permission.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">

                                            <div className="font-medium text-slate-900">
                                                {permission.name}
                                            </div>

                                            <div className="mt-1 text-xs text-slate-400">
                                                Permission #{permission.id}
                                            </div>

                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {permission.description || '—'}
                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setViewPermissionId(permission.id)
                                                    }
                                                    title="View"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditPermissionId(permission.id)
                                                    }
                                                    title="Edit"
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeletePermissionId(permission.id)
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

            {!loading && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">

                    <p className="text-sm text-slate-500">
                        Showing{' '}
                        <span className="font-medium text-slate-700">
                            {(page - 1) * PAGE_SIZE + 1}
                        </span>
                        {'–'}
                        <span className="font-medium text-slate-700">
                            {Math.min(page * PAGE_SIZE, total)}
                        </span>
                        {' of '}
                        <span className="font-medium text-slate-700">
                            {total}
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                            disabled={page <= 1}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                            Prev
                        </button>

                        <span className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                            disabled={page >= totalPages}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>

                </div>
            )}

            {showCreate && (
                <PermissionForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false)
                        loadPermissions()
                    }}
                />
            )}

            {viewPermissionId !== null && (
                <PermissionView
                    permissionId={viewPermissionId}
                    onClose={() =>
                        setViewPermissionId(null)
                    }
                />
            )}

            {editPermissionId !== null && (
                <PermissionEdit
                    permissionId={editPermissionId}
                    onClose={() =>
                        setEditPermissionId(null)
                    }
                    onSuccess={() => {
                        setEditPermissionId(null)
                        loadPermissions()
                    }}
                />
            )}

            {deletePermissionId !== null && (
                <PermissionDelete
                    permissionName={
                        permissions.find(
                            (permission) =>
                                permission.id === deletePermissionId
                        )?.name ?? 'this permission'
                    }
                    loading={deleting}
                    error={error}
                    onClose={() => {
                        setDeletePermissionId(null)
                        setError('')
                    }}
                    onConfirm={handleDelete}
                />
            )}

        </div>
    )
}

export default Permissions