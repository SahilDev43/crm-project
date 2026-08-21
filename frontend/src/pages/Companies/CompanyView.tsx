import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { getCompany } from '../../api/companies'
import type { Company } from '../../types/company'

interface CompanyViewProps {
  companyId: number
  onClose: () => void
}

function CompanyView({
  companyId,
  onClose,
}: CompanyViewProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getCompany(companyId)

        setCompany(data)
      } catch (error: any) {
        if (error.response?.data?.detail) {
          setError(error.response.data.detail)
        } else {
          setError('Unable to load company.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [companyId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Company Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View company information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}
        <div className="p-6">

          {loading && (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading company...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && company && (
            <div className="space-y-6">

              {/* Company heading */}
              <div className="flex items-center gap-4">

                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {company.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Company ID: {company.id}
                  </p>
                </div>

                <span
                  className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                    company.is_active
                      ? 'bg-green-50 text-green-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {company.is_active
                    ? 'Active'
                    : 'Inactive'}
                </span>

              </div>

              {/* Information */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Company Name
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {company.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    GST Number
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {company.gst_number || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    State
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {company.state || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    State Code
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {company.state_code || '-'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {company.company_address || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {new Date(
                      company.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {new Date(
                      company.updated_at
                    ).toLocaleString()}
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  )
}

export default CompanyView