import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { getPermission } from '../../api/permissions'
import type { Permission } from '../../types/permission'

interface PermissionViewProps {
  permissionId: number
  onClose: () => void
}

function PermissionView({
  permissionId,
  onClose,
}: PermissionViewProps) {
  const [permission, setPermission] =
    useState<Permission | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPermission = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getPermission(permissionId)

        setPermission(data)
      } catch (error: any) {
        if (error.response?.data?.detail) {
          setError(error.response.data.detail)
        } else {
          setError('Unable to load permission.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadPermission()
  }, [permissionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Permission Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View permission information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-6">

          {loading && (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading permission...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && permission && (
            <div className="space-y-5">

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Permission Name
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {permission.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {permission.description ||
                    'No description provided.'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Permission ID
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  #{permission.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Created
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {new Date(
                    permission.created_at
                  ).toLocaleString()}
                </p>
              </div>

            </div>
          )}

        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  )
}

export default PermissionView