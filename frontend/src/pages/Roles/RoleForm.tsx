import { useState } from 'react'
import { X } from 'lucide-react'

import { createRole } from '../../api/roles'
import type { RoleCreate } from '../../types/role'

interface RoleFormProps {
  onClose: () => void
  onSuccess: () => void
}

function RoleForm({
  onClose,
  onSuccess,
}: RoleFormProps) {
  const [form, setForm] = useState<RoleCreate>({
    name: '',
    description: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')

    if (!form.name.trim()) {
      setError('Role name is required.')
      return
    }

    try {
      setLoading(true)

      await createRole({
        name: form.name.trim(),
        description: form.description?.trim() || null,
      })

      onSuccess()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to create role.')
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
              Add Role
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create a new CRM role.
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

          <div className="p-6">

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Role Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={1}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                placeholder="e.g. Sales Manager"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description ?? ''}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                placeholder="Describe what this role is responsible for..."
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
              {loading ? 'Creating...' : 'Create Role'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default RoleForm