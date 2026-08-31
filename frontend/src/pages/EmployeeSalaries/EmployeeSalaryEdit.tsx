import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import {
    getEmployeeSalary,
    updateEmployeeSalary,
} from '../../api/employeeSalaries'
import { getSalaryStructure } from '../../api/salaryStructures'
import { getUser } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import {
    SALARY_STATUS,
    SALARY_STATUS_OPTIONS,
    employeeName,
} from '../../lib/payroll'

interface EmployeeSalaryEditProps {
    salaryId: number
    onClose: () => void
    onSuccess: () => void
}

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500'

function EmployeeSalaryEdit({
    salaryId,
    onClose,
    onSuccess,
}: EmployeeSalaryEditProps) {
    const [employeeLabel, setEmployeeLabel] = useState('')
    const [structureLabel, setStructureLabel] = useState('')

    const [effectiveFrom, setEffectiveFrom] = useState('')
    const [effectiveTo, setEffectiveTo] = useState('')
    const [hadEffectiveTo, setHadEffectiveTo] = useState(false)
    const [basicSalary, setBasicSalary] = useState('')
    const [grossSalary, setGrossSalary] = useState('')
    const [status, setStatus] = useState<number>(SALARY_STATUS.ACTIVE)
    const [remarks, setRemarks] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadSalary = async () => {
            try {
                setLoading(true)
                setError('')

                const salary = await getEmployeeSalary(salaryId)

                setEffectiveFrom(salary.effective_from)
                setEffectiveTo(salary.effective_to ?? '')
                setHadEffectiveTo(salary.effective_to !== null)
                setBasicSalary(salary.basic_salary)
                setGrossSalary(salary.gross_salary ?? '')
                setStatus(salary.status)
                setRemarks(salary.remarks ?? '')

                const [user, structure] = await Promise.allSettled([
                    getUser(salary.user_id),
                    getSalaryStructure(salary.salary_structure_id),
                ])

                setEmployeeLabel(
                    user.status === 'fulfilled'
                        ? `${employeeName(user.value, salary.user_id)} (${
                              user.value.email
                          })`
                        : `User #${salary.user_id}`,
                )

                setStructureLabel(
                    structure.status === 'fulfilled'
                        ? `${structure.value.name} (${structure.value.code})`
                        : `Structure #${salary.salary_structure_id}`,
                )
            } catch (err: unknown) {
                setError(
                    getApiErrorMessage(
                        err,
                        'Unable to load employee salary.',
                    ),
                )
            } finally {
                setLoading(false)
            }
        }

        void loadSalary()
    }, [salaryId])

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')

        if (basicSalary.trim() === '' || Number(basicSalary) < 0) {
            setError('Enter a valid basic salary.')
            return
        }

        if (grossSalary.trim() !== '' && Number(grossSalary) < 0) {
            setError('Gross salary cannot be negative.')
            return
        }

        if (!effectiveFrom) {
            setError('Effective From is required.')
            return
        }

        if (
            effectiveTo &&
            effectiveFrom &&
            effectiveTo < effectiveFrom
        ) {
            setError('Effective To cannot be before Effective From.')
            return
        }

        try {
            setSaving(true)

            await updateEmployeeSalary(salaryId, {
                effective_from: effectiveFrom,
                // Preserve an existing end date; only send when present.
                effective_to: effectiveTo || undefined,
                basic_salary: basicSalary.trim(),
                gross_salary: grossSalary.trim() || undefined,
                status,
                remarks: remarks.trim() || undefined,
            })

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to update employee salary.',
                ),
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Edit Employee Salary
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Record #{salaryId}
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
                                Loading employee salary...
                            </div>
                        ) : (
                            <div className="space-y-4">

                                {error && (
                                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            Employee
                                        </p>
                                        <p className="text-slate-700">
                                            {employeeLabel}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-400">
                                            Salary Structure
                                        </p>
                                        <p className="text-slate-700">
                                            {structureLabel}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Effective From *
                                        </label>

                                        <input
                                            type="date"
                                            value={effectiveFrom}
                                            onChange={(event) =>
                                                setEffectiveFrom(
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Effective To
                                        </label>

                                        <input
                                            type="date"
                                            value={effectiveTo}
                                            onChange={(event) =>
                                                setEffectiveTo(
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />

                                        {hadEffectiveTo && (
                                            <p className="mt-1 text-xs text-slate-400">
                                                This record already has an end
                                                date — clearing it here has no
                                                effect.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Basic Salary (₹) *
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={basicSalary}
                                            onChange={(event) =>
                                                setBasicSalary(
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Gross Salary (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={grossSalary}
                                            onChange={(event) =>
                                                setGrossSalary(
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(
                                                Number(event.target.value),
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        {SALARY_STATUS_OPTIONS.map((option) => (
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
                                        Remarks
                                    </label>

                                    <textarea
                                        value={remarks}
                                        onChange={(event) =>
                                            setRemarks(event.target.value)
                                        }
                                        rows={2}
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>

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

export default EmployeeSalaryEdit
