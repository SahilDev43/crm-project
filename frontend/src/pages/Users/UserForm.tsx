import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { createUser } from '../../api/users'
import { getCompanies } from '../../api/companies'
import { getRoles } from '../../api/roles'

import type { UserCreate } from '../../types/user'
import type { Company } from '../../types/company'
import type { Role } from '../../types/role'


interface UserFormProps {
  onClose: () => void
  onSuccess: () => void
}

function UserForm({
  onClose,
  onSuccess,
}: UserFormProps) {
  const [companies, setCompanies] =
    useState<Company[]>([])

  const [roles, setRoles] =
    useState<Role[]>([])

  const [form, setForm] =
    useState<UserCreate>({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      company_id: 0,
      role_id: null,
    })

  const [loading, setLoading] =
    useState(false)

  const [loadingOptions, setLoadingOptions] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)

        const [
          companiesData,
          rolesData,
        ] = await Promise.all([
          getCompanies(),
          getRoles(),
        ])

        setCompanies(companiesData)
        setRoles(rolesData)
      } catch (error: any) {
        if (error.response?.data?.detail) {
          setError(
            error.response.data.detail
          )
        } else {
          setError(
            'Unable to load companies and roles.'
          )
        }
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'company_id'
          ? Number(value)
          : name === 'role_id'
            ? value
              ? Number(value)
              : null
            : value,
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')

    if (!form.company_id) {
      setError('Please select a company.')
      return
    }

    try {
      setLoading(true)

      await createUser(form)

      onSuccess()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(
          error.response.data.detail
        )
      } else {
        setError(
          'Unable to create user.'
        )
      }
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
              Add User
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create a new CRM user.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="max-h-[70vh] overflow-y-auto p-6">

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  First Name *
                </label>

                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Last Name *
                </label>

                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Company *
                </label>

                <select
                  name="company_id"
                  value={form.company_id || ''}
                  onChange={handleChange}
                  required
                  disabled={loadingOptions}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    {loadingOptions
                      ? 'Loading companies...'
                      : 'Select company'}
                  </option>

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  name="role_id"
                  value={form.role_id ?? ''}
                  onChange={handleChange}
                  disabled={loadingOptions}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    No role
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

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
              disabled={
                loading ||
                loadingOptions
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Creating...'
                : 'Create User'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default UserForm