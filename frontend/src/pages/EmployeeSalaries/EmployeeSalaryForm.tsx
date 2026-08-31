import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { createEmployeeSalary } from '../../api/employeeSalaries'
import { getSalaryStructures } from '../../api/salaryStructures'
import { getUsers } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import {
    SALARY_STATUS,
    SALARY_STATUS_OPTIONS,
    employeeName,
} from '../../lib/payroll'
import type { SalaryStructure } from '../../types/salaryStructure'
import type { User } from '../../types/user'

interface EmployeeSalaryFormProps {
    onClose: () => void
    onSuccess: () => void
}

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500'

function EmployeeSalaryForm({
    onClose,
    onSuccess,
}: EmployeeSalaryFormProps) {
    const [users, setUsers] = useState<User[]>([])
    const [structures, setStructures] = useState<SalaryStructure[]>([])

    const [userId, setUserId] = useState('')
    const [structureId, setStructureId] = useState('')
    const [effectiveFrom, setEffectiveFrom] = useState('')
    const [effectiveTo, setEffectiveTo] = useState('')
    const [basicSalary, setBasicSalary] = useState('')
    const [grossSalary, setGrossSalary] = useState('')
    const [status, setStatus] = useState<number>(SALARY_STATUS.ACTIVE)
    const [remarks, setRemarks] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        Promise.all([
            getUsers({ page: 1, page_size: 100 }),
            getSalaryStructures({ page: 1, page_size: 100 }),
        ])
            .then(([userData, structureData]) => {
                if (active) {
                    setUsers(userData.items)
                    setStructures(
                        structureData.items.filter(
                            (structure) => structure.is_active,
                        ),
                    )
                }
            })
            .catch(() => {
                if (active) {
                    setUsers([])
                    setStructures([])
                }
            })

        return () => {
            active = false
        }
    }, [])

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')

        if (!userId) {
            setError('Select an employee.')
            return
        }

        if (!structureId) {
            setError('Select a salary structure.')
            return
        }

        if (!effectiveFrom) {
            setError('Effective From is required.')
            return
        }

        if (basicSalary.trim() === '' || Number(basicSalary) < 0) {
            setError('Enter a valid basic salary.')
            return
        }

        if (grossSalary.trim() !== '' && Number(grossSalary) < 0) {
            setError('Gross salary cannot be negative.')
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
            setLoading(true)

            await createEmployeeSalary({
                user_id: Number(userId),
                salary_structure_id: Number(structureId),
                effective_from: effectiveFrom,
                effective_to: effectiveTo || null,
                basic_salary: basicSalary.trim(),
                gross_salary: grossSalary.trim() || null,
                status,
                remarks: remarks.trim() || null,
            })

            onSuccess()
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to assign employee salary.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Assign Employee Salary
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Link an employee to a salary structure for a period.
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
                                Employee *
                            </label>

                            <select
                                value={userId}
                                onChange={(event) =>
                                    setUserId(event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Select an employee</option>

                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {employeeName(user, user.id)} (
                                        {user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Salary Structure *
                            </label>

                            <select
                                value={structureId}
                                onChange={(event) =>
                                    setStructureId(event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Select a structure</option>

                                {structures.map((structure) => (
                                    <option
                                        key={structure.id}
                                        value={structure.id}
                                    >
                                        {structure.name} ({structure.code})
                                    </option>
                                ))}
                            </select>
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
                                        setEffectiveFrom(event.target.value)
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
                                        setEffectiveTo(event.target.value)
                                    }
                                    className={inputClass}
                                />
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
                                        setBasicSalary(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="e.g. 40000.00"
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
                                        setGrossSalary(event.target.value)
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
                                    setStatus(Number(event.target.value))
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
                                placeholder="Optional notes..."
                            />
                        </div>

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
                            {loading ? 'Assigning...' : 'Assign Salary'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default EmployeeSalaryForm
