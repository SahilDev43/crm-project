import { useEffect, useState } from 'react'
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'

import { getLeads } from '../../api/leads'
import { getCompanies } from '../../api/companies'

import type { Lead } from '../../types/lead'
import type { Company } from '../../types/company'

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [companies, setCompanies] = useState<Company[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [viewLeadId, setViewLeadId] =
    useState<number | null>(null)
  const [editLeadId, setEditLeadId] =
    useState<number | null>(null)
  const [deleteLeadId, setDeleteLeadId] =
    useState<number | null>(null)

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError('')

      const [leadData, companyData] =
        await Promise.all([
          getLeads(),
          getCompanies(),
        ])

      setLeads(leadData)
      setCompanies(companyData.items)
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Unable to load leads.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const getCompanyName = (
    companyId: number
  ) => {
    return (
      companies.find(
        (company) => company.id === companyId
      )?.name ?? `Company #${companyId}`
    )
  }

  const getLeadName = (lead: Lead) => {
    const name = [
      lead.first_name,
    ]
      .filter(Boolean)
      .join(' ')

    return name || 'Unnamed Lead'
  }

  return (
    <div className="p-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leads
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={17} />
          Add Lead
        </button>

      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Lead
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Company
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                    Source
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">

                      <p className="font-medium text-slate-900">
                        {getLeadName(lead)}
                      </p>

                      {lead.client_company_name && (
                        <p className="mt-1 text-xs text-slate-400">
                          {lead.client_company_name}
                        </p>
                      )}

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {getCompanyName(lead.company_id)}
                    </td>

                    <td className="px-6 py-4">

                      <p className="text-sm text-slate-700">
                        {lead.email || '—'}
                      </p>

                      {lead.phone && (
                        <p className="mt-1 text-xs text-slate-400">
                          {lead.phone}
                        </p>
                      )}

                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {lead.status?.name || '—'}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {lead.source || '—'}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            setViewLeadId(lead.id)
                          }
                          title="View"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditLeadId(lead.id)
                          }
                          title="Edit"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteLeadId(lead.id)
                          }
                          title="Delete"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Lead popups will be connected next */}

    </div>
  )
}

export default Leads