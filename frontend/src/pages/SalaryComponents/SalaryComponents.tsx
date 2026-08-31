import { useEffect, useState } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Pencil,
    Plus,
    Power,
    Search,
    Trash2,
} from 'lucide-react'

import {
    getSalaryComponents,
    updateSalaryComponent,
} from '../../api/salaryComponents'
import { getApiErrorMessage } from '../../api/errors'
import { useAuth } from '../../auth/AuthContext'
import {
    COMPONENT_TYPE_OPTIONS,
    componentTypeBadge,
    componentTypeLabel,
} from '../../lib/payroll'
import type { SalaryComponent } from '../../types/salaryComponent'
import SalaryComponentForm from './SalaryComponentForm'
import SalaryComponentEdit from './SalaryComponentEdit'
import SalaryComponentDelete from './SalaryComponentDelete'

const PAGE_SIZE = 10

function SalaryComponents() {
    const { hasPermission } = useAuth()

    const canCreate = hasPermission('salary_components.create')
    const canUpdate = hasPermission('salary_components.update')
    const canDelete = hasPermission('salary_components.delete')

    const [components, setComponents] = useState<SalaryComponent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [showCreate, setShowCreate] = useState(false)
    const [editComponentId, setEditComponentId] = useState<number | null>(null)
    const [deleteComponent, setDeleteComponent] =
        useState<SalaryComponent | null>(null)
    const [togglingId, setTogglingId] = useState<number | null>(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim())
            setPage(1)
        }, 400)

        return () => clearTimeout(timeout)
    }, [search])

    const loadComponents = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getSalaryComponents({
                search: debouncedSearch || undefined,
                component_type: typeFilter ? Number(typeFilter) : undefined,
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

            setComponents(data.items)
            setTotal(data.total)
            setTotalPages(data.total_pages)
        } catch (err: unknown) {
            setComponents([])
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to load salary components.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadComponents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, typeFilter, page])

    const handleToggleActive = async (component: SalaryComponent) => {
        const nextActive = !component.is_active

        if (
            !window.confirm(
                `${nextActive ? 'Activate' : 'Deactivate'} "${component.name}"?`,
            )
        ) {
            return
        }

        try {
            setTogglingId(component.id)
            setError('')

            await updateSalaryComponent(component.id, {
                is_active: nextActive,
            })

            await loadComponents()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to update salary component.',
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
                        Salary Components
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Earning and deduction building blocks for salary
                        structures.
                    </p>
                </div>

                {canCreate && (
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <Plus size={17} />
                        Create Component
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
                    value={typeFilter}
                    onChange={(event) => {
                        setTypeFilter(event.target.value)
                        setPage(1)
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                >
                    <option value="">All types</option>

                    {COMPONENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading salary components...
                    </div>
                ) : components.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        {debouncedSearch || typeFilter
                            ? 'No salary components match the current filters.'
                            : 'No salary components found.'}
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
                                        Type
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

                                {components.map((component) => (
                                    <tr
                                        key={component.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">
                                                {component.name}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                Component #{component.id}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                                                {component.code}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${componentTypeBadge(
                                                    component.component_type,
                                                )}`}
                                            >
                                                {componentTypeLabel(
                                                    component.component_type,
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="line-clamp-2 max-w-[18rem]">
                                                {component.description || '—'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    component.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {component.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-1">

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        title={
                                                            component.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'
                                                        }
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                component,
                                                            )
                                                        }
                                                        disabled={
                                                            togglingId ===
                                                            component.id
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
                                                            setEditComponentId(
                                                                component.id,
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
                                                            setDeleteComponent(
                                                                component,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

                                                {!canUpdate && !canDelete && (
                                                    <span className="px-2 text-xs text-slate-400">
                                                        —
                                                    </span>
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
                <SalaryComponentForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false)
                        void loadComponents()
                    }}
                />
            )}

            {editComponentId !== null && (
                <SalaryComponentEdit
                    componentId={editComponentId}
                    onClose={() => setEditComponentId(null)}
                    onSuccess={() => {
                        setEditComponentId(null)
                        void loadComponents()
                    }}
                />
            )}

            {deleteComponent && (
                <SalaryComponentDelete
                    componentId={deleteComponent.id}
                    componentName={deleteComponent.name}
                    onClose={() => setDeleteComponent(null)}
                    onSuccess={() => {
                        setDeleteComponent(null)
                        void loadComponents()
                    }}
                />
            )}

        </div>
    )
}

export default SalaryComponents
