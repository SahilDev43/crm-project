import { AlertTriangle, X } from 'lucide-react'

interface RoleDeleteProps {
  roleName: string
  loading: boolean
  error: string
  onClose: () => void
  onConfirm: () => void
}

function RoleDelete({
  roleName,
  loading,
  error,
  onClose,
  onConfirm,
}: RoleDeleteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Delete Role
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-6">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={21} />
            </div>

            <div>
              <h3 className="font-medium text-slate-900">
                Are you sure?
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                You are about to delete{' '}
                <span className="font-semibold text-slate-900">
                  {roleName}
                </span>
                .
                This action cannot be undone.
              </p>
            </div>

          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

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
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Role'}
          </button>

        </div>

      </div>

    </div>
  )
}

export default RoleDelete