import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { getSalaryComponents } from '../../api/salaryComponents'
import {
    getSalaryStructure,
    getSalaryStructureComponents,
} from '../../api/salaryStructures'
import { getApiErrorMessage } from '../../api/errors'
import { useAuth } from '../../auth/AuthContext'
import {
    CALCULATION_TYPE,
    calculationBaseLabel,
    calculationTypeLabel,
    componentTypeBadge,
    componentTypeLabel,
    formatCurrency,
    formatDate,
} from '../../lib/payroll'
import type { SalaryComponent } from '../../types/salaryComponent'
import type {
    SalaryStructure,
    SalaryStructureComponent,
} from '../../types/salaryStructure'
import SalaryStructureEdit from './SalaryStructureEdit'
import StructureComponentForm from './StructureComponentForm'
import StructureComponentDelete from './StructureComponentDelete'

function SalaryStructureDetail() {
    const { structureId } = useParams<{ structureId: string }>()
    const navigate = useNavigate()
    const { hasPermission } = useAuth()

    const canUpdate = hasPermission('salary_structures.update')

    const id = Number(structureId)

    const [structure, setStructure] = useState<SalaryStructure | null>(null)
    const [components, setComponents] = useState<SalaryStructureComponent[]>([])
    const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(
        [],
    )

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showEdit, setShowEdit] = useState(false)
    const [showAddComponent, setShowAddComponent] = useState(false)
    const [removeTarget, setRemoveTarget] =
        useState<SalaryStructureComponent | null>(null)

    const componentsById = useMemo(() => {
        const map = new Map<number, SalaryComponent>()

        for (const component of salaryComponents) {
            map.set(component.id, component)
        }

        return map
    }, [salaryComponents])

    const resolveComponent = useCallback(
        (componentId: number) => componentsById.get(componentId),
        [componentsById],
    )

    const load = useCallback(async () => {
        if (!Number.isFinite(id)) {
            setError('Invalid salary structure.')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError('')

            const [structureData, componentData, salaryComponentData] =
                await Promise.all([
                    getSalaryStructure(id),
                    getSalaryStructureComponents(id),
                    getSalaryComponents({ page: 1, page_size: 100 }),
                ])

            setStructure(structureData)
            setComponents(componentData)
            setSalaryComponents(salaryComponentData.items)
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to load salary structure.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load()
    }, [load])

    const usedComponentIds = useMemo(
        () => new Set(components.map((entry) => entry.salary_component_id)),
        [components],
    )

    const availableComponents = useMemo(
        () =>
            salaryComponents.filter(
                (component) =>
                    component.is_active &&
                    !usedComponentIds.has(component.id),
            ),
        [salaryComponents, usedComponentIds],
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Loading salary structure...
            </div>
        )
    }

    if (error || !structure) {
        return (
            <div className="p-6">
                <button
                    type="button"
                    onClick={() => navigate('/salary-structures')}
                    className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to Salary Structures
                </button>

                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error || 'Salary structure not found.'}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">

            <button
                type="button"
                onClick={() => navigate('/salary-structures')}
                className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={16} />
                Back to Salary Structures
            </button>

            <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {structure.name}
                        </h1>

                        <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                structure.is_active
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {structure.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                            {structure.code}
                        </span>
                        <span className="ml-3">
                            Updated {formatDate(structure.updated_at)}
                        </span>
                    </p>

                    {structure.description && (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                            {structure.description}
                        </p>
                    )}
                </div>

                {canUpdate && (
                    <button
                        type="button"
                        onClick={() => setShowEdit(true)}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil size={16} />
                        Edit Structure
                    </button>
                )}

            </div>

            <div className="mt-8 flex items-center justify-between">

                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Salary Components
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                        Calculation rules only — payroll processing computes the
                        actual amounts.
                    </p>
                </div>

                {canUpdate && (
                    <button
                        type="button"
                        onClick={() => setShowAddComponent(true)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <Plus size={17} />
                        Add Component
                    </button>
                )}

            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

                {components.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        No components in this structure yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Component
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Calculation Type
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Calculation Base
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Active
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {components.map((entry) => {
                                    const component = resolveComponent(
                                        entry.salary_component_id,
                                    )

                                    const baseComponent =
                                        entry.calculation_base_component_id !==
                                        null
                                            ? resolveComponent(
                                                  entry.calculation_base_component_id,
                                              )
                                            : undefined

                                    const isPercentage =
                                        entry.calculation_type ===
                                        CALCULATION_TYPE.PERCENTAGE

                                    return (
                                        <tr
                                            key={entry.id}
                                            className="hover:bg-slate-50"
                                        >

                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {component?.name ??
                                                        `Component #${entry.salary_component_id}`}
                                                </div>
                                                {component && (
                                                    <div className="mt-1 text-xs text-slate-400">
                                                        {component.code}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {component ? (
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${componentTypeBadge(
                                                            component.component_type,
                                                        )}`}
                                                    >
                                                        {componentTypeLabel(
                                                            component.component_type,
                                                        )}
                                                    </span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {calculationTypeLabel(
                                                    entry.calculation_type,
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {calculationBaseLabel(
                                                    entry.calculation_base,
                                                )}
                                                {baseComponent && (
                                                    <span className="text-slate-400">
                                                        {' · '}
                                                        {baseComponent.code}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                                {isPercentage
                                                    ? `${entry.value}%`
                                                    : formatCurrency(
                                                          entry.value,
                                                      )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        entry.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {entry.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end">
                                                    {canUpdate ? (
                                                        <button
                                                            type="button"
                                                            title="Remove component"
                                                            onClick={() =>
                                                                setRemoveTarget(
                                                                    entry,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    ) : (
                                                        <span className="px-2 text-xs text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                        </tr>
                                    )
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {showEdit && (
                <SalaryStructureEdit
                    structureId={id}
                    onClose={() => setShowEdit(false)}
                    onSuccess={() => {
                        setShowEdit(false)
                        void load()
                    }}
                />
            )}

            {showAddComponent && (
                <StructureComponentForm
                    structureId={id}
                    availableComponents={availableComponents}
                    existingComponents={components}
                    resolveComponent={resolveComponent}
                    onClose={() => setShowAddComponent(false)}
                    onSuccess={() => {
                        setShowAddComponent(false)
                        void load()
                    }}
                />
            )}

            {removeTarget && (
                <StructureComponentDelete
                    structureId={id}
                    componentId={removeTarget.id}
                    componentName={
                        resolveComponent(removeTarget.salary_component_id)
                            ?.name ??
                        `Component #${removeTarget.salary_component_id}`
                    }
                    onClose={() => setRemoveTarget(null)}
                    onSuccess={() => {
                        setRemoveTarget(null)
                        void load()
                    }}
                />
            )}

        </div>
    )
}

export default SalaryStructureDetail
