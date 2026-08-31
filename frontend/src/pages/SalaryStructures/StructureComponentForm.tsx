import { useMemo, useState } from 'react'
import { X } from 'lucide-react'

import { addSalaryStructureComponent } from '../../api/salaryStructures'
import { getApiErrorMessage } from '../../api/errors'
import {
    CALCULATION_BASE,
    CALCULATION_BASE_OPTIONS,
    CALCULATION_TYPE,
    CALCULATION_TYPE_OPTIONS,
    componentTypeLabel,
} from '../../lib/payroll'
import type { SalaryComponent } from '../../types/salaryComponent'
import type {
    SalaryStructureComponent,
    SalaryStructureComponentCreate,
} from '../../types/salaryStructure'

interface StructureComponentFormProps {
    structureId: number
    /** Active salary components not already attached to the structure. */
    availableComponents: SalaryComponent[]
    /** Components already in the structure — usable as a percentage base. */
    existingComponents: SalaryStructureComponent[]
    resolveComponent: (id: number) => SalaryComponent | undefined
    onClose: () => void
    onSuccess: () => void
}

function StructureComponentForm({
    structureId,
    availableComponents,
    existingComponents,
    resolveComponent,
    onClose,
    onSuccess,
}: StructureComponentFormProps) {
    const [salaryComponentId, setSalaryComponentId] = useState('')
    const [calculationType, setCalculationType] = useState<number>(
        CALCULATION_TYPE.FIXED,
    )
    const [calculationBase, setCalculationBase] = useState<number>(
        CALCULATION_BASE.BASIC,
    )
    const [baseComponentId, setBaseComponentId] = useState('')
    const [value, setValue] = useState('')
    const [isActive, setIsActive] = useState(true)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const isPercentage = calculationType === CALCULATION_TYPE.PERCENTAGE
    const needsBaseComponent =
        isPercentage && calculationBase === CALCULATION_BASE.COMPONENT

    const baseComponentChoices = useMemo(
        () =>
            existingComponents
                .map((entry) => ({
                    id: entry.salary_component_id,
                    component: resolveComponent(entry.salary_component_id),
                }))
                .filter((entry) => entry.component !== undefined),
        [existingComponents, resolveComponent],
    )

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')

        if (!salaryComponentId) {
            setError('Select a salary component.')
            return
        }

        if (value.trim() === '' || Number.isNaN(Number(value))) {
            setError('Enter a valid numeric value.')
            return
        }

        if (Number(value) < 0) {
            setError('Value cannot be negative.')
            return
        }

        if (needsBaseComponent && !baseComponentId) {
            setError('Select the base component for this percentage.')
            return
        }

        const payload: SalaryStructureComponentCreate = {
            salary_component_id: Number(salaryComponentId),
            calculation_type: calculationType,
            value: value.trim(),
            is_active: isActive,
        }

        if (isPercentage) {
            payload.calculation_base = calculationBase

            if (needsBaseComponent) {
                payload.calculation_base_component_id = Number(baseComponentId)
            }
        }

        try {
            setLoading(true)

            await addSalaryStructureComponent(structureId, payload)

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to add component to structure.',
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
                            Add Structure Component
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Defines a calculation rule — payroll processing
                            computes the amount.
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

                        {availableComponents.length === 0 ? (
                            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                Every active salary component is already in this
                                structure. Create a new component or reactivate
                                one first.
                            </div>
                        ) : (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Salary Component *
                                </label>

                                <select
                                    value={salaryComponentId}
                                    onChange={(event) =>
                                        setSalaryComponentId(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                >
                                    <option value="">Select a component</option>

                                    {availableComponents.map((component) => (
                                        <option
                                            key={component.id}
                                            value={component.id}
                                        >
                                            {component.name} ({component.code}) —{' '}
                                            {componentTypeLabel(
                                                component.component_type,
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Calculation Type *
                            </label>

                            <select
                                value={calculationType}
                                onChange={(event) =>
                                    setCalculationType(
                                        Number(event.target.value),
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                            >
                                {CALCULATION_TYPE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isPercentage && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Calculation Base *
                                </label>

                                <select
                                    value={calculationBase}
                                    onChange={(event) =>
                                        setCalculationBase(
                                            Number(event.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                >
                                    {CALCULATION_BASE_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {needsBaseComponent && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Base Component *
                                </label>

                                <select
                                    value={baseComponentId}
                                    onChange={(event) =>
                                        setBaseComponentId(event.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                >
                                    <option value="">Select a component</option>

                                    {baseComponentChoices.map((entry) => (
                                        <option key={entry.id} value={entry.id}>
                                            {entry.component?.name} (
                                            {entry.component?.code})
                                        </option>
                                    ))}
                                </select>

                                {baseComponentChoices.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                        Add the base component to the structure
                                        first.
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                {isPercentage
                                    ? 'Percentage (%) *'
                                    : 'Amount (₹) *'}
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={value}
                                onChange={(event) =>
                                    setValue(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                                placeholder={
                                    isPercentage ? 'e.g. 40' : 'e.g. 15000.00'
                                }
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
                            disabled={
                                loading || availableComponents.length === 0
                            }
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Component'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default StructureComponentForm
