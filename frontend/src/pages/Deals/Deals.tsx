import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Search,
  Eye,
  Pencil,
  UserPlus,
  CheckCircle,
  Trash2,
  X,
} from 'lucide-react'

import { getCompanies } from '../../api/companies'
import { assignDeal, deleteDeal, getDeals, getDealStatuses } from '../../api/deals'
import { getUser, getUsers } from '../../api/users'
import { useAuth } from '../../auth/AuthContext'
import type { Company } from '../../types/company'
import type { Deal, DealStatus } from '../../types/deal'
import type { User } from '../../types/user'
import DealModal from './DealModal'

const PAGE_SIZE = 10

function Deals() {
  const { user: currentUser } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [statuses, setStatuses] = useState<DealStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState<{ id: number, mode: 'view' | 'edit' | 'assign' } | null>(null)
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [companyData, userData, statusData] = await Promise.all([
          getCompanies({ page_size: 100 }),
          getUsers({ page_size: 100 }),
          getDealStatuses(),
        ])

        setCompanies(companyData.items)
        setUsers(userData.items)
        setStatuses(statusData)
      } catch {
        // Deal rows still render with ID fallbacks if lookup data is unavailable.
      }
    }

    loadLookups()
  }, [])

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getDeals({
          company_id: companyId ? Number(companyId) : undefined,
          search: debouncedSearch || undefined,
          page,
          page_size: PAGE_SIZE,
        })

        if (data.items.length === 0 && page > 1 && data.total_pages > 0) {
          setPage(data.total_pages)
          return
        }

        setDeals(data.items)
        setTotal(data.total)
        setTotalPages(data.total_pages)

        const assigneeIds = [...new Set(
          data.items
            .map((deal) => deal.assigned_to)
            .filter((id): id is number => id !== null && id !== undefined)
        )]
        const userResults = await Promise.allSettled(
          assigneeIds.map((id) => getUser(id))
        )
        const loadedUsers = userResults
          .filter((result): result is PromiseFulfilledResult<User> => result.status === 'fulfilled')
          .map((result) => result.value)
        setUsers((currentUsers) => [
          ...currentUsers.filter((user) => !assigneeIds.includes(user.id)),
          ...loadedUsers,
        ])
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Unable to load deals.')
      } finally {
        setLoading(false)
      }
    }

    loadDeals()
  }, [companyId, debouncedSearch, page, reloadKey])

  const companyName = (id: number) =>
    companies.find((company) => company.id === id)?.name ?? `Company #${id}`

  const assigneeName = (id: number | null | undefined) => {
    if (!id) {
      return 'Unassigned'
    }

    const user = users.find((item) => item.id === id)
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown user'
  }

  const statusName = (id: number) =>
    statuses.find((status) => status.id === id)?.name ?? 'Unknown status'

  const refresh = (successMessage?: string) => {
    if (successMessage) setMessage(successMessage)
    setModal(null)
    setReloadKey((value) => value + 1)
  }

  const acceptDeal = async (deal: Deal) => {
    if (!currentUser || deal.assigned_to) return
    try {
      setError('')
      await assignDeal(deal.id, { assigned_to: currentUser.id })
      refresh('Deal accepted successfully.')
    } catch (error: any) { setError(error.response?.data?.detail || 'Unable to accept deal.') }
  }

  const confirmDelete = async () => {
    if (!dealToDelete) return
    try {
      setDeleting(true)
      await deleteDeal(dealToDelete.id)
      setDealToDelete(null)
      refresh('Deal deleted successfully.')
    } catch (error: any) { setError(error.response?.data?.detail || 'Unable to delete deal.') } finally { setDeleting(false) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Deals</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage your sales pipeline.</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search deals..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500" />
        </label>
        <select value={companyId} onChange={(event) => { setCompanyId(event.target.value); setPage(1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500">
          <option value="">All companies</option>
          {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-red-600" />Loading deals...</div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500"><FileText className="h-8 w-8 text-slate-300" />{debouncedSearch ? `No deals match "${debouncedSearch}".` : 'No deals found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Deal</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Client</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Company</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Assigned To</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Budget</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4"><p className="font-medium text-slate-900">{deal.title}</p><p className="mt-1 text-xs text-slate-500">Deal #{deal.id}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-slate-700">{deal.client_name}</p><p className="mt-1 text-xs text-slate-500">{deal.client_email || '—'}</p></td>
                    <td className="px-6 py-4 text-sm text-slate-700">{companyName(deal.company_id)}</td>
                    <td className="px-6 py-4"><span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{statusName(deal.deal_status_id)}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-700">{assigneeName(deal.assigned_to)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{deal.budget || '—'}</td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setModal({ id: deal.id, mode: 'view' })} title="View" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye size={16} /></button><button type="button" onClick={() => setModal({ id: deal.id, mode: 'edit' })} title="Edit" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><button type="button" onClick={() => setModal({ id: deal.id, mode: 'assign' })} title="Assign" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><UserPlus size={16} /></button><button type="button" onClick={() => acceptDeal(deal)} disabled={Boolean(deal.assigned_to) || !currentUser} title={deal.assigned_to ? 'Already assigned' : 'Accept Deal'} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle size={16} /></button><button type="button" onClick={() => setDealToDelete(deal)} title="Delete" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600">
          <span>{total} deal{total === 1 ? '' : 's'} found</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((currentPage) => currentPage - 1)} disabled={page === 1} className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} /></button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" onClick={() => setPage((currentPage) => currentPage + 1)} disabled={page >= totalPages} className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
      {modal && <DealModal dealId={modal.id} mode={modal.mode} companies={companies} users={users} statuses={statuses} onClose={() => setModal(null)} onSuccess={refresh} />}
      {dealToDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><h2 className="text-lg font-semibold text-slate-900">Delete Deal</h2><button type="button" onClick={() => setDealToDelete(null)} disabled={deleting} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><div className="p-6 text-sm text-slate-600">Delete <span className="font-semibold text-slate-900">{dealToDelete.title}</span>? This action cannot be undone.</div><div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" onClick={() => setDealToDelete(null)} disabled={deleting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="button" onClick={confirmDelete} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete Deal'}</button></div></div></div>}
    </div>
  )
}

export default Deals
