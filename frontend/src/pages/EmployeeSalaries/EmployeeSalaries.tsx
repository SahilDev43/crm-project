import { useEffect, useMemo, useState } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react'

import { getEmployeeSalaries } from '../../api/employeeSalaries'
import { getSalaryStructures } from '../../api/salaryStructures'
import { getUsers } from '../../api/users'
import { getApiErrorMessage } from '../../api/errors'
import { useAuth } from '../../auth/AuthContext'
import {
    SALARY_STATUS_OPTIONS,
    employeeName,
    formatCurrency,
    formatDate,
    salaryStatusBadge,
    salaryStatusLabel,
} from '../../lib/payroll'
import type { EmployeeSalary } from '../../types/employeeSalary'
import type { SalaryStructure } from '../../types/salaryStructure'
import type { User } from '../../types/user'
import EmployeeSalaryForm from './EmployeeSalaryForm'
import EmployeeSalaryEdit from './EmployeeSalaryEdit'
import EmployeeSalaryDelete from './EmployeeSalaryDelete'

const PAGE_SIZE = 10

function EmployeeSalaries() {
    const { hasPermission } = useAuth()

    const canCreate = hasPermission('employee_salaries.create')
    const canUpdate = hasPermission('employee_salaries.update')
    const canDelete = hasPermission('employee_salaries.delete')

    const [salaries, setSalaries] = useState<EmployeeSalary[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [structures, setStructures] = useState<SalaryStructure[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [userFilter, setUserFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [showCreate, setShowCreate] = useState(false)
    const [editSalaryId, setEditSalaryId] = useState<number | null>(null)
    const [deleteSalary, setDeleteSalary] = useState<EmployeeSalary | null>(
        null,
    )

    const usersById = useMemo(() => {
        const map = new Map<number, User>()

        for (const user of users) {
            map.set(user.id, user)
        }

        return map
    }, [users])

    const structuresById = useMemo(() => {
        const map = new Map<number, SalaryStructure>()

        for (const structure of structures) {
            map.set(structure.id, structure)
        }

        return map
    }, [structures])

    useEffect(() => {
        let active = true

        Promise.all([
            getUsers({ page: 1, page_size: 100 }),
            getSalaryStructures({ page: 1, page_size: 100 }),
        ])
            .then(([userData, structureData]) => {
                if (active) {
                    setUsers(userData.items)
                    setStructures(structureData.items)
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

    const loadSalaries = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getEmployeeSalaries({
                user_id: userFilter ? Number(userFilter) : undefined,
                status: statusFilter ? Number(statusFilter) : undefined,
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

            setSalaries(data.items)
            setTotal(data.total)
            setTotalPages(data.total_pages)
        } catch (err: unknown) {
            setSalaries([])
            setError(
                getApiErrorMessage(
                    err,
                    'Unable to load employee salaries.',
                ),
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadSalaries()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userFilter, statusFilter, page])

    const labelFor = (salary: EmployeeSalary) =>
        employeeName(usersById.get(salary.user_id), salary.user_id)

    return (
        <div className="p-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Employee Salaries
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Salary structure assignments and pay for each employee.
                    </p>
                </div>

                {canCreate && (
                    <button
                        type="button"
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                        <Plus size={17} />
                        Assign Salary
                    </button>
                )}

            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-end gap-4">

                <select
                    value={userFilter}
                    onChange={(event) => {
                        setUserFilter(event.target.value)
                        setPage(1)
                    }}
                    className="min-w-[14rem] rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                >
                    <option value="">All employees</option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {employeeName(user, user.id)}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value)
                        setPage(1)
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500"
                >
                    <option value="">All statuses</option>

                    {SALARY_STATUS_OPTIONS.map((option) => (
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
                        Loading employee salaries...
                    </div>
                ) : salaries.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        {userFilter || statusFilter
                            ? 'No employee salaries match the current filters.'
                            : 'No employee salaries assigned yet.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Salary Structure
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Basic Salary
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Gross Salary
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Effective From
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                                        Effective To
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

                                {salaries.map((salary) => (
                                    <tr
                                        key={salary.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">
                                                {labelFor(salary)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                {usersById.get(salary.user_id)
                                                    ?.email ?? ''}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {structuresById.get(
                                                salary.salary_structure_id,
                                            )?.name ??
                                                `Structure #${salary.salary_structure_id}`}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                            {formatCurrency(salary.basic_salary)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatCurrency(salary.gross_salary)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatDate(salary.effective_from)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {salary.effective_to
                                                ? formatDate(
                                                      salary.effective_to,
                                                  )
                                                : 'Ongoing'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${salaryStatusBadge(
                                                    salary.status,
                                                )}`}
                                            >
                                                {salaryStatusLabel(
                                                    salary.status,
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-1">

                                                {canUpdate && (
                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            setEditSalaryId(
                                                                salary.id,
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
                                                            setDeleteSalary(
                                                                salary,
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
                <EmployeeSalaryForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false)
                        void loadSalaries()
                    }}
                />
            )}

            {editSalaryId !== null && (
                <EmployeeSalaryEdit
                    salaryId={editSalaryId}
                    onClose={() => setEditSalaryId(null)}
                    onSuccess={() => {
                        setEditSalaryId(null)
                        void loadSalaries()
                    }}
                />
            )}

            {deleteSalary && (
                <EmployeeSalaryDelete
                    salaryId={deleteSalary.id}
                    employeeLabel={labelFor(deleteSalary)}
                    onClose={() => setDeleteSalary(null)}
                    onSuccess={() => {
                        setDeleteSalary(null)
                        void loadSalaries()
                    }}
                />
            )}

        </div>
    )
}

export default EmployeeSalaries
