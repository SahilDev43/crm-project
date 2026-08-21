import { useEffect, useState } from 'react'
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
import CompanyForm from './CompanyForm'
import CompanyView from './CompanyView'

function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [companyToView, setCompanyToView] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {

    if (!companyToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await deleteCompany(companyToDelete.id)

      setCompanyToDelete(null)

      await loadCompanies()
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError("Unable to delete company")
      }
    } finally {
      setDeleting(false)
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
          type="button"
          onClick={() => {
            setCompanyToEdit(null)
            setShowForm(true)
          }}
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
                        onClick={() => setCompanyToView(company.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        title="View"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button" onClick={() => {
                          setCompanyToEdit(company)
                          setShowForm(true)
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCompanyToDelete(company)
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

        {showForm && (
          <CompanyForm company={companyToEdit} onClose={() => {
            setShowForm(false)
            setCompanyToEdit(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setCompanyToEdit(null)
            loadCompanies()
          }}
          />
        )}

      {companyToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setCompanyToDelete(null)
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Delete Company
              </h2>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setCompanyToDelete(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* Body */}
            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to delete
                {' '}
                <span className="font-semibold text-slate-900">
                  {companyToDelete.name}
                </span>
                ?
              </p>

              <p className="mt-2 text-sm text-slate-500">
                This action cannot be undone.
              </p>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                disabled={deleting}
                onClick={() => setCompanyToDelete(null)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Company'}
              </button>

            </div>

          </div>
        </div>
      )}

      {companyToView !== null && (
        <CompanyView
          companyId={companyToView}
          onClose={() => setCompanyToView(null)}
        />
      )}

    </div>
  )
}

export default Companies