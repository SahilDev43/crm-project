import { useEffect, useState } from "react"
import {
    Plus,
    Eye,
    Pencil,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

import { getUsers } from '../../api/users'
import { getAssetUrl } from '../../api/client'
import type { User as UserType } from '../../types/user'
import UserForm from './UserForm'
import UserView from "./UserView"
import UserEdit from './UserEdit'
import UserDelete from './UserDelete'
import type { Company } from '../../types/company'
import type { Role } from '../../types/role'
import { getCompanies } from '../../api/companies'
import { getRoles } from '../../api/roles'

const PAGE_SIZE = 10

function User() {
    const [users, setUsers] = useState<UserType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showUserForm, setShowUserForm] = useState(false)
    const [viewUserId, setViewUserId] = useState<number | null>(null)
    const [editUserId, setEditUserId] = useState<number | null>(null)
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
    const [companies, setCompanies] = useState<Company[]>([])
    const [roles, setRoles] = useState<Role[]>([])

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim())
            setPage(1)
        }, 400)

        return () => clearTimeout(timeout)
    }, [search])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getUsers({
                search: debouncedSearch || undefined,
                page,
                page_size: PAGE_SIZE,
            })

            if (data.items.length === 0 && page > 1 && data.total_pages > 0) {
                setPage(data.total_pages)
                return
            }

            setUsers(data.items)
            setTotal(data.total)
            setTotalPages(data.total_pages)
        } catch (error: any) {
            if (error.response?.data?.detail) {
                setError(error.response.data.detail)
            } else {
                setError('Unable to load users.')
            }
        } finally {
            setLoading(false)
        }
    }

    const loadCompanies = async () => {
        try {
            const data = await getCompanies({ page_size: 100 })

            setCompanies(data.items)
        } catch (error) {
            // ignore, company name falls back to '-'
        }
    }

    const loadRoles = async () => {
        try {
            const data = await getRoles()

            setRoles(data)
        } catch (error) {
            // ignore, role name falls back to '-'
        }
    }

    useEffect(() => {
        loadUsers()
    }, [debouncedSearch, page])

    useEffect(() => {
        loadCompanies()
        loadRoles()
    }, [])

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Users
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage CRM users and their access.
                    </p>
                </div>

                <button
                    type="button" onClick={() => setShowUserForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                    <Plus size={17} />
                    Add User
                </button>

            </div>

            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="relative max-w-sm">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="overflow-x-auto">

                    <table className="w-full text-left">

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    User
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    Phone
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    Company
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                    Actions
                                </th>
                            </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading users...
                                    </td>
                                </tr>

                            ) : users.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        {debouncedSearch
                                            ? `No users match "${debouncedSearch}".`
                                            : 'No users found.'}
                                    </td>
                                </tr>

                            ) : (

                                users.map((user) => {
                                    const companyName = companies.find((company) => company.id === user.company_id)?.name ?? '-'
                                    const roleName = roles.find((role) => role.id === user.role_id)?.name ?? '-'

                                    return (

                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                {user.profile_image ? (
                                                    <img
                                                        src={getAssetUrl(user.profile_image)}
                                                        alt={`${user.first_name} ${user.last_name}`}
                                                        className="h-9 w-9 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600">
                                                        {user.first_name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {user.first_name} {user.last_name}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        #{user.id}
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.phone || '—'}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {companyName}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {roleName}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.is_active
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {user.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-1">

                                                <button
                                                    type="button" onClick={() => setViewUserId(user.id)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setEditUserId(user.id)}
                                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteUserId(user.id)}
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                    )
                                })

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between">

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

            {showUserForm && (
                <UserForm
                    onClose={() => setShowUserForm(false)}
                    onSuccess={() => {
                        setShowUserForm(false)
                        loadUsers()
                    }}
                />
            )}

            {viewUserId !== null && (
                <UserView
                    userId={viewUserId}
                    onClose={() => setViewUserId(null)}
                />
            )}

            {editUserId !== null && (
                <UserEdit
                    userId={editUserId}
                    onClose={() => setEditUserId(null)}
                    onSuccess={() => {
                        setEditUserId(null)
                        loadUsers()
                    }}
                />
            )}

            {deleteUserId !== null && (
                <UserDelete
                    userId={deleteUserId}
                    userName={
                        users.find(
                            (user) => user.id === deleteUserId
                        )
                            ? `${users.find(
                                (user) => user.id === deleteUserId
                            )?.first_name} ${users.find(
                                (user) => user.id === deleteUserId
                            )?.last_name
                            }`
                            : 'this user'
                    }
                    onClose={() => setDeleteUserId(null)}
                    onSuccess={() => {
                        setDeleteUserId(null)
                        loadUsers()
                    }}
                />
            )}

        </div>
    )
}

export default User