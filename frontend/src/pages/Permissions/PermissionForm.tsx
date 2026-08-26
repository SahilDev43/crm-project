import { useState } from 'react'
import { X } from 'lucide-react'

import { createPermission } from '../../api/permissions'
import type { PermissionCreate } from '../../types/permission'

interface PermissionFormProps {
  onClose: () => void
  onSuccess: () => void
}

function PermissionForm({
  onClose,
  onSuccess,
}: PermissionFormProps) {
  const [form, setForm] = useState<PermissionCreate>({
    name: '',
    description: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
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

    if (form.name.trim().length < 3) {
      setError('Permission name must be at least 3 characters.')
      return
    }

    if (form.description && form.description.length > 100) {
      setError('Description cannot exceed 100 characters.')
      return
    }

    try {
      setLoading(true)

      await createPermission({
        name: form.name.trim(),
        description: form.description?.trim() || null,
      })

      onSuccess()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to create permission.')
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
              Add Permission
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create a new CRM permission.
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
                Permission Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                placeholder="e.g. users.create"
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
                maxLength={100}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500"
                placeholder="Describe what this permission allows..."
              />

              <p className="mt-1 text-xs text-slate-400">
                Maximum 100 characters.
              </p>
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
              {loading ? 'Creating...' : 'Create Permission'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default PermissionForm