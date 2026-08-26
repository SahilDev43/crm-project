import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Building2,
  X,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import {
  getCompanies,
  deleteCompany,
} from '../../api/companies'

import type { Company } from '../../types/company'
import CompanyForm from './CompanyForm'
import CompanyView from './CompanyView'

const PAGE_SIZE = 10

function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [companyToView, setCompanyToView] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getCompanies({
        search: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      })

      if (data.items.length === 0 && page > 1 && data.total_pages > 0) {
        setPage(data.total_pages)
        return
      }

      setCompanies(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
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
  }, [debouncedSearch, page])

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
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
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

      <div className="relative mb-4 max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search companies..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {loading ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
            <Building2 className="h-8 w-8 text-slate-300" />
            {debouncedSearch
              ? `No companies match "${debouncedSearch}".`
              : 'No companies found.'}
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
                  className="transition-colors hover:bg-slate-50"
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
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        title="View"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button" onClick={() => {
                          setCompanyToEdit(company)
                          setShowForm(true)
                        }}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCompanyToDelete(company)
                        }
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
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

      {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">

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

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle size={18} />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Delete Company
                </h2>

              </div>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setCompanyToDelete(null)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
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
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
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