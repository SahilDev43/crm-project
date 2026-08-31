import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Power,
    Search,
    Trash2,
} from 'lucide-react'

import {
    getSalaryStructures,
    updateSalaryStructure,
} from '../../api/salaryStructures'
import { getApiErrorMessage } from '../../api/errors'
import { useAuth } from '../../auth/AuthContext'
import type { SalaryStructure } from '../../types/salaryStructure'
import SalaryStructureForm from './SalaryStructureForm'
import SalaryStructureEdit from './SalaryStructureEdit'
import SalaryStructureDelete from './SalaryStructureDelete'

const PAGE_SIZE = 10

function SalaryStructures() {
    const navigate = useNavigate()
    const { hasPermission } = useAuth()

    const canCreate = hasPermission('salary_structures.create')
    const canUpdate = hasPermission('salary_structures.update')
    const canDelete = hasPermission('salary_structures.delete')

    const [structures, setStructures] = useState<SalaryStructure[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [showCreate, setShowCreate] = useState(false)
    const [editStructureId, setEditStructureId] = useState<number | null>(null)
    const [deleteStructure, setDeleteStructure] =
        useState<SalaryStructure | null>(null)
    const [togglingId, setTogglingId] = useState<number | null>(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim())
            setPage(1)
        }, 400)

        return () => clearTimeout(timeout)
    }, [search])

    const loadStructures = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getSalaryStructures({
                search: debouncedSearch || undefined,
                is_active:
                    statusFilter === ''
                        ? undefined
                        : statusFilter === 'active',
                page,
                page_size: PAGE_SIZE,
            })

            if (
                data.items.length === 0 &&
                page > 1 &&
                data.total_pages > 0
            ) {
                setPage(data.total_pages)
                return
            }

            setStructures(data.items)
            setTotal(data.total)
            setTotalPages(data.total_pages)
        } catch (err: unknown) {
            setStructures([])
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to load salary structures.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadStructures()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusFilter, page])

    const handleToggleActive = async (structure: SalaryStructure) => {
        const nextActive = !structure.is_active

        if (
            !window.confirm(
                `${nextActive ? 'Activate' : 'Deactivate'} "${structure.name}"?`,
            )
        ) {
            return
        }

        try {
            setTogglingId(structure.id)
            setError('')

            await updateSalaryStructure(structure.id, {
                is_active: nextActive,
            })

            await loadStructures()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to update salary structure.',
                ),
            )
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <div className="p-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Salary Structures
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Named sets of salary component rules assigned to
                        employees.
                    </p>
                </div>

                {canCreate && (
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <Plus size={17} />
                        Create Structure
                    </button>
                )}

            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-end gap-4">

                <div className="relative max-w-sm flex-1">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or code..."
                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value)
                        setPage(1)
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading salary structures...
                    </div>
                ) : structures.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        {debouncedSearch || statusFilter
                            ? 'No salary structures match the current filters.'
                            : 'No salary structures found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {structures.map((structure) => (
                                    <tr
                                        key={structure.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/salary-structures/${structure.id}`,
                                                    )
                                                }
                                                className="font-medium text-slate-900 hover:text-red-600"
                                            >
                                                {structure.name}
                                            </button>
                                            <div className="mt-1 text-xs text-slate-400">
                                                Structure #{structure.id}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                                                {structure.code}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="line-clamp-2 max-w-[18rem]">
                                                {structure.description || '—'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    structure.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {structure.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-1">

                                                <button
                                                    type="button"
                                                    title="View structure"
                                                    onClick={() =>
                                                        navigate(
                                                            `/salary-structures/${structure.id}`,
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        title={
                                                            structure.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'
                                                        }
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                structure,
                                                            )
                                                        }
                                                        disabled={
                                                            togglingId ===
                                                            structure.id
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                )}

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            setEditStructureId(
                                                                structure.id,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        onClick={() =>
                                                            setDeleteStructure(
                                                                structure,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

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
                            onClick={() =>
                                setPage((value) => Math.max(1, value - 1))
                            }
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
                            onClick={() =>
                                setPage((value) =>
                                    Math.min(totalPages, value + 1),
                                )
                            }
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
                <SalaryStructureForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false)
                        void loadStructures()
                    }}
                />
            )}

            {editStructureId !== null && (
                <SalaryStructureEdit
                    structureId={editStructureId}
                    onClose={() => setEditStructureId(null)}
                    onSuccess={() => {
                        setEditStructureId(null)
                        void loadStructures()
                    }}
                />
            )}

            {deleteStructure && (
                <SalaryStructureDelete
                    structureId={deleteStructure.id}
                    structureName={deleteStructure.name}
                    onClose={() => setDeleteStructure(null)}
                    onSuccess={() => {
                        setDeleteStructure(null)
                        void loadStructures()
                    }}
                />
            )}

        </div>
    )
}

export default SalaryStructures
