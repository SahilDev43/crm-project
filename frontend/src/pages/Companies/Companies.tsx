import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react'

import {
  getCompanies,
  deleteCompany,
} from '../../api/companies'

import type { Company } from '../../types/company'

function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getCompanies()

      setCompanies(data)
    } catch {
      setError(
        'Unable to load companies.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleDelete = async (
    companyId: number
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this company?'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteCompany(companyId)

      await loadCompanies()
    } catch {
      setError(
        'Unable to delete company.'
      )
    }
  }

  return (
    <div>

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Companies
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your CRM companies.
          </p>
        </div>

        <button
          type="button" onClick={() => navigate('/companies/new')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Company
        </button>

      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No companies found.
          </div>
        ) : (
          <table className="w-full">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Company
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  GST
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  State
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-200">

              {companies.map((company) => (

                <tr
                  key={company.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {company.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      ID: {company.id}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {company.gst_number || '-'}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {company.state || '-'}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={
                        company.is_active
                          ? 'rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600'
                          : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500'
                      }
                    >
                      {company.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        title="View"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(company.id)
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  )
}

export default Companies