import { useEffect, useState } from 'react'
import {
  Eye,
  Trash2,
  Handshake,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { getLeads, getLeadStatuses } from '../../api/leads'
import { getCompanies } from '../../api/companies'

import type { Lead, LeadStatus } from '../../types/lead'
import type { Company } from '../../types/company'
import DealFromLeadForm from './DealFromLeadForm'
import LeadDelete from './LeadDelete'
import LeadView from './LeadView'

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [statuses, setStatuses] = useState<LeadStatus[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [statusId, setStatusId] = useState('')
  const [leadType, setLeadType] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [viewLead, setViewLead] = useState<Lead | null>(null)
  const [dealLead, setDealLead] = useState<Lead | null>(null)
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError('')

      const [leadData, companyData] =
        await Promise.all([
          getLeads({
            company_id: companyId ? Number(companyId) : undefined,
            status_id: statusId ? Number(statusId) : undefined,
            lead_type: leadType || undefined,
            search: debouncedSearch || undefined,
            page,
            page_size: 10,
          }),
          getCompanies({ page_size: 100 }),
        ])

      if (leadData.items.length === 0 && page > 1 && leadData.total_pages > 0) {
        setPage(leadData.total_pages)
        return
      }

      setLeads(leadData.items)
      setCompanies(companyData.items)
      setTotal(leadData.total)
      setTotalPages(leadData.total_pages)
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
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    loadLeads()
  }, [debouncedSearch, companyId, statusId, leadType, page])

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        setStatuses(await getLeadStatuses())
      } catch {
        // The list can still be filtered by company, type, and search.
      }
    }

    loadStatuses()
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

      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <select value={companyId} onChange={(event) => { setCompanyId(event.target.value); setPage(1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">All companies</option>
          {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
        <select value={statusId} onChange={(event) => { setStatusId(event.target.value); setPage(1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
        </select>
        <input
          value={leadType}
          onChange={(event) => { setLeadType(event.target.value); setPage(1) }}
          placeholder="Filter by lead type"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
      </div>

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

                        {!lead.is_converted && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setViewLead(lead)
                              }
                              title="View"
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDealLead(lead)
                              }
                              title="Add to Deal"
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Handshake size={16} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteLead(lead)
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

      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600">
          <span>{total} lead{total === 1 ? '' : 's'} found</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((currentPage) => currentPage - 1)} disabled={page === 1} className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} /></button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" onClick={() => setPage((currentPage) => currentPage + 1)} disabled={page >= totalPages} className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {viewLead && (
        <LeadView
          lead={viewLead}
          company={companies.find((company) => company.id === viewLead.company_id)}
          onClose={() => setViewLead(null)}
        />
      )}

      {dealLead && (
        <DealFromLeadForm
          lead={dealLead}
          companyName={getCompanyName(dealLead.company_id)}
          onClose={() => setDealLead(null)}
          onSuccess={() => {
            setLeads((currentLeads) =>
              currentLeads.map((lead) =>
                lead.id === dealLead.id
                  ? { ...lead, is_converted: true }
                  : lead
              )
            )
            setDealLead(null)
            setSuccessMessage('Deal created successfully.')
            loadLeads()
          }}
        />
      )}

      {deleteLead && (
        <LeadDelete
          leadId={deleteLead.id}
          leadName={getLeadName(deleteLead)}
          onClose={() => setDeleteLead(null)}
          onSuccess={() => {
            setDeleteLead(null)
            setSuccessMessage('Lead deleted successfully.')
            loadLeads()
          }}
        />
      )}

    </div>
  )
}

export default Leads
