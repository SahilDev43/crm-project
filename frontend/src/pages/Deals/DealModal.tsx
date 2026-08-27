import { useEffect, useState } from 'react'
import { Save, Send, X } from 'lucide-react'

import {
  addDealComment,
  assignDeal,
  getDeal,
  getDealFeed,
  getDealPlatforms,
  getDealProjectTypes,
  updateDeal,
  updateDealStatus,
} from '../../api/deals'
import type { Company } from '../../types/company'
import type { Deal, DealFeedEntry, DealMasterData, DealStatus, DealUpdate } from '../../types/deal'
import type { User } from '../../types/user'

interface DealModalProps {
  dealId: number
  mode: 'view' | 'edit' | 'assign'
  companies: Company[]
  users: User[]
  statuses: DealStatus[]
  onClose: () => void
  onSuccess: (message: string) => void
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500'

function DealModal({ dealId, mode, companies, users, statuses, onClose, onSuccess }: DealModalProps) {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [feed, setFeed] = useState<DealFeedEntry[]>([])
  const [projectTypes, setProjectTypes] = useState<DealMasterData[]>([])
  const [platforms, setPlatforms] = useState<DealMasterData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [form, setForm] = useState<DealUpdate>({})
  const [assignedTo, setAssignedTo] = useState('')
  const [statusId, setStatusId] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const [dealData, feedData, projectTypeData, platformData] = await Promise.all([getDeal(dealId), getDealFeed(dealId), getDealProjectTypes(), getDealPlatforms()])
      setDeal(dealData)
      setFeed(feedData)
      setProjectTypes(projectTypeData)
      setPlatforms(platformData)
      setForm({
        title: dealData.title,
        client_name: dealData.client_name,
        company_id: dealData.company_id,
        project_type_id: dealData.project_type_id,
        platform_id: dealData.platform_id,
        platform_external_id: dealData.platform_external_id,
        job_description: dealData.job_description,
        url: dealData.url,
        client_email: dealData.client_email,
        client_phone: dealData.client_phone,
        contact_email: dealData.contact_email,
        contact_phone: dealData.contact_phone,
        contact_description: dealData.contact_description,
        budget: dealData.budget,
        meeting_time: dealData.meeting_time,
      })
      setAssignedTo(dealData.assigned_to?.toString() ?? '')
      setStatusId(dealData.deal_status_id.toString())
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Unable to load deal details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [dealId])

  const setText = (field: keyof DealUpdate, value: string) => setForm((current) => ({ ...current, [field]: value || null }))
  const setNumber = (field: keyof DealUpdate, value: string) => setForm((current) => ({ ...current, [field]: value ? Number(value) : null }))

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSaving(true)
      await updateDeal(dealId, form)
      onSuccess('Deal updated successfully.')
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Unable to update deal.')
    } finally { setSaving(false) }
  }

  const submitAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!assignedTo) { setError('Select a user to assign this deal.'); return }
    try {
      setSaving(true)
      await assignDeal(dealId, { assigned_to: Number(assignedTo) })
      onSuccess('Deal assigned successfully.')
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Unable to assign deal.')
    } finally { setSaving(false) }
  }

  const submitStatus = async () => {
    if (!deal || Number(statusId) === deal.deal_status_id) return
    try {
      setSaving(true)
      await updateDealStatus(dealId, { deal_status_id: Number(statusId) })
      await load()
      onSuccess('Deal status updated successfully.')
    } catch (error: any) { setError(error.response?.data?.detail || 'Unable to update deal status.') } finally { setSaving(false) }
  }

  const submitComment = async () => {
    if (!comment.trim()) return
    try {
      setSaving(true)
      await addDealComment(dealId, comment)
      setComment('')
      await load()
    } catch (error: any) { setError(error.response?.data?.detail || 'Unable to add comment.') } finally { setSaving(false) }
  }

  const companyName = deal ? companies.find((company) => company.id === deal.company_id)?.name ?? 'Unknown company' : ''
  const userName = (id: number | null | undefined) => users.find((user) => user.id === id) ? `${users.find((user) => user.id === id)?.first_name} ${users.find((user) => user.id === id)?.last_name}` : 'Unassigned'
  const statusName = deal ? statuses.find((status) => status.id === deal.deal_status_id)?.name ?? 'Unknown status' : ''
  const projectTypeName = deal?.project_type_id ? projectTypes.find((item) => item.id === deal.project_type_id)?.name ?? 'Unknown project type' : '—'
  const platformName = deal?.platform_id ? platforms.find((item) => item.id === deal.platform_id)?.name ?? 'Unknown platform' : '—'

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="text-xl font-semibold text-slate-900">{mode === 'edit' ? 'Edit Deal' : mode === 'assign' ? 'Assign Deal' : 'Deal Details'}</h2><p className="mt-1 text-sm text-slate-500">{deal?.title || 'Loading deal...'}</p></div><button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button></div>
      {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading deal...</div> : error && !deal ? <div className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div> : deal && <div className="grid min-h-0 flex-1 lg:grid-cols-[1.2fr_.8fr]">
        <div className="overflow-y-auto p-6">
          {error && <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          {mode === 'edit' ? <form onSubmit={submitEdit} className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><input required value={form.title ?? ''} onChange={(event) => setText('title', event.target.value)} className={inputClass} /></Field><Field label="Client Name"><input required value={form.client_name ?? ''} onChange={(event) => setText('client_name', event.target.value)} className={inputClass} /></Field>
            <Field label="Company"><select value={form.company_id ?? ''} onChange={(event) => setNumber('company_id', event.target.value)} className={inputClass}>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></Field><Field label="Budget"><input value={form.budget ?? ''} onChange={(event) => setText('budget', event.target.value)} className={inputClass} /></Field>
            <Field label="Client Email"><input type="email" value={form.client_email ?? ''} onChange={(event) => setText('client_email', event.target.value)} className={inputClass} /></Field><Field label="Client Phone"><input value={form.client_phone ?? ''} onChange={(event) => setText('client_phone', event.target.value)} className={inputClass} /></Field>
            <Field label="Project Type"><select value={form.project_type_id ?? ''} onChange={(event) => setNumber('project_type_id', event.target.value)} className={inputClass}><option value="">Not specified</option>{projectTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Platform"><select value={form.platform_id ?? ''} onChange={(event) => setNumber('platform_id', event.target.value)} className={inputClass}><option value="">Not specified</option>{platforms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Contact Email"><input type="email" value={form.contact_email ?? ''} onChange={(event) => setText('contact_email', event.target.value)} className={inputClass} /></Field><Field label="Contact Phone"><input value={form.contact_phone ?? ''} onChange={(event) => setText('contact_phone', event.target.value)} className={inputClass} /></Field>
            <Field label="Meeting Time"><input value={form.meeting_time ?? ''} onChange={(event) => setText('meeting_time', event.target.value)} className={inputClass} /></Field><Field label="URL"><input value={form.url ?? ''} onChange={(event) => setText('url', event.target.value)} className={inputClass} /></Field>
            <div className="md:col-span-2"><Field label="Job Description"><textarea rows={4} value={form.job_description ?? ''} onChange={(event) => setText('job_description', event.target.value)} className={inputClass} /></Field></div>
            <div className="md:col-span-2 flex justify-end"><button disabled={saving} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Save size={16} />{saving ? 'Saving...' : 'Save Deal'}</button></div>
          </form> : mode === 'assign' ? <form onSubmit={submitAssignment} className="max-w-md space-y-4"><Field label="Assign to"><select required value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className={inputClass}><option value="">Select user</option>{users.filter((user) => user.is_active).map((user) => <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>)}</select></Field><button disabled={saving} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Assigning...' : 'Assign Deal'}</button></form> : <div className="space-y-5"><Detail label="Title" value={deal.title} /><div className="grid gap-5 sm:grid-cols-2"><Detail label="Client" value={deal.client_name} /><Detail label="Company" value={companyName} /><Detail label="Status" value={statusName} /><Detail label="Assigned To" value={userName(deal.assigned_to)} /><Detail label="Project Type" value={projectTypeName} /><Detail label="Platform" value={platformName} /><Detail label="Client Email" value={deal.client_email} /><Detail label="Client Phone" value={deal.client_phone} /><Detail label="Contact Email" value={deal.contact_email} /><Detail label="Contact Phone" value={deal.contact_phone} /><Detail label="Budget" value={deal.budget} /><Detail label="Meeting Time" value={deal.meeting_time} /><Detail label="Lead" value={deal.lead_id ? `Lead #${deal.lead_id}` : null} /><Detail label="Updated" value={new Date(deal.updated_at).toLocaleString()} /></div><Detail label="Job Description" value={deal.job_description} /><Detail label="URL" value={deal.url} /><div className="flex items-end gap-3 border-t border-slate-200 pt-5"><Field label="Status"><select value={statusId} onChange={(event) => setStatusId(event.target.value)} className={inputClass}>{statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}</select></Field><button type="button" onClick={submitStatus} disabled={saving || statusId === deal.deal_status_id.toString()} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50">Update Status</button></div></div>}
        </div>
        <div className="flex min-h-0 flex-col border-l border-slate-200 bg-slate-50"><div className="border-b border-slate-200 px-5 py-4"><h3 className="font-semibold text-slate-900">Activity</h3></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">{feed.length === 0 ? <p className="text-sm text-slate-500">No activity yet.</p> : feed.map((entry) => <div key={entry.id} className="rounded-lg bg-white p-3 shadow-sm"><p className="text-sm text-slate-800"><span className="font-medium">{entry.actor_name || 'System'}</span> {entry.event_type === 'comment' ? 'commented:' : entry.content}</p>{entry.event_type === 'comment' && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{entry.content}</p>}<p className="mt-2 text-xs text-slate-400">{new Date(entry.created_at).toLocaleString()}</p></div>)}</div><div className="border-t border-slate-200 bg-white p-4"><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." rows={2} className={inputClass} /><button type="button" onClick={submitComment} disabled={saving || !comment.trim()} className="mt-2 ml-auto flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"><Send size={15} />Comment</button></div></div>
      </div>}
    </div>
  </div>
}

function Field({ label, children }: { label: string, children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700">{label}<span className="mt-1.5 block">{children}</span></label> }
function Detail({ label, value }: { label: string, value: string | null | undefined }) { return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value || '—'}</p></div> }

export default DealModal
