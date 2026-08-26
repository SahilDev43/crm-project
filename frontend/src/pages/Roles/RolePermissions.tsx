import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import {
  getRolePermissions,
  assignRolePermission,
  removeRolePermission,
} from '../../api/roles'

import { getPermissions } from '../../api/permissions'

import type { Permission } from '../../types/permission'

interface RolePermissionsProps {
  roleId: number
  roleName: string
  onClose: () => void
}

function RolePermissions({
  roleId,
  roleName,
  onClose,
}: RolePermissionsProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [initialIds, setInitialIds] = useState<Set<number>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const loadPermissions = async () => {
    try {
      setLoading(true)
      setError('')

      const [allPermissions, rolePermissions] =
        await Promise.all([
          getPermissions({ page_size: 100 }),
          getRolePermissions(roleId),
        ])

      const assignedIds = new Set(
        rolePermissions.map((permission) => permission.id)
      )

      setPermissions(allPermissions.items)
      setInitialIds(assignedIds)
      setSelectedIds(new Set(assignedIds))
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to load permissions.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [roleId])

  const isSelected = (permissionId: number) => {
    return selectedIds.has(permissionId)
  }

  const toggleSelected = (permissionId: number) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)

      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }

      return next
    })
  }

  const hasChanges =
    selectedIds.size !== initialIds.size ||
    [...selectedIds].some((id) => !initialIds.has(id))

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const toAdd = [...selectedIds].filter(
        (id) => !initialIds.has(id)
      )

      const toRemove = [...initialIds].filter(
        (id) => !selectedIds.has(id)
      )

      await Promise.all([
        ...toAdd.map((permissionId) =>
          assignRolePermission(roleId, permissionId)
        ),
        ...toRemove.map((permissionId) =>
          removeRolePermission(roleId, permissionId)
        ),
      ])

      setInitialIds(new Set(selectedIds))

      onClose()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to update role permissions.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Manage Permissions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {roleName}
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

        <div className="overflow-y-auto p-6">

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading permissions...
            </div>
          ) : permissions.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No permissions available.
            </div>
          ) : (
            <div className="space-y-2">

              {permissions.map((permission) => {
                const selected = isSelected(
                  permission.id
                )

                return (
                  <label
                    key={permission.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                      selected
                        ? 'border-red-200 bg-red-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={saving}
                      onChange={() =>
                        toggleSelected(
                          permission.id
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-red-600"
                    />

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium text-slate-900">
                        {permission.name}
                      </p>

                      {permission.description && (
                        <p className="mt-1 text-xs text-slate-500">
                          {permission.description}
                        </p>
                      )}

                    </div>

                  </label>
                )
              })}

            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving || !hasChanges}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </div>

      </div>

    </div>
  )
}

export default RolePermissions
