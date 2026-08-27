import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { createDeal } from '../../api/deals'
import { getUsers } from '../../api/users'
import type { DealCreate } from '../../types/deal'
import type { Lead } from '../../types/lead'
import type { User } from '../../types/user'

interface DealFromLeadFormProps {
  lead: Lead
  companyName: string
  onClose: () => void
  onSuccess: () => void
}

const numberOrUndefined = (value: string): number | undefined => {
  const parsed = Number(value)
  return value === '' || !Number.isInteger(parsed) ? undefined : parsed
}

const textOrUndefined = (value: string): string | undefined =>
  value.trim() || undefined

function DealFromLeadForm({ lead, companyName, onClose, onSuccess }: DealFromLeadFormProps) {
  const initialClientName = lead.client_company_name?.trim() || lead.first_name?.trim() || ''
  const [title, setTitle] = useState(initialClientName)
  const [clientName, setClientName] = useState(initialClientName)
  const [projectTypeId, setProjectTypeId] = useState('')
  const [platformId, setPlatformId] = useState('')
  const [budget, setBudget] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [contactEmail, setContactEmail] = useState(lead.email ?? '')
  const [contactPhone, setContactPhone] = useState(lead.phone ?? '')
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers({ page_size: 100 })
        setUsers(response.items)
      } catch {
        // Assignment is optional, so a failed user lookup does not block creation.
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !clientName.trim()) {
      setError('Title and client name are required.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const data: DealCreate = {
        title: title.trim(),
        client_name: clientName.trim(),
        deal_status_id: 1,
        company_id: lead.company_id,
        lead_id: lead.id,
        external_lead_id: lead.external_lead_id ?? undefined,
        client_email: lead.email ?? undefined,
        client_phone: lead.phone ?? undefined,
        contact_email: textOrUndefined(contactEmail),
        contact_phone: textOrUndefined(contactPhone),
        job_description: lead.message ?? undefined,
        url: lead.website_url ?? undefined,
        project_type_id: numberOrUndefined(projectTypeId),
        platform_id: numberOrUndefined(platformId),
        budget: textOrUndefined(budget),
        meeting_time: textOrUndefined(meetingTime),
        assigned_to: numberOrUndefined(assignedTo),
      }

      await createDeal(data)
      onSuccess()
    } catch (error: any) {
      const detail = error.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to create deal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && !loading && onClose()}>
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Add Lead to Deal</h2>
            <p className="mt-1 text-sm text-slate-500">Lead information has been carried into this deal.</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Title" required><input value={title} onChange={(event) => setTitle(event.target.value)} required className={inputClass} /></Field>
              <Field label="Client Name" required><input value={clientName} onChange={(event) => setClientName(event.target.value)} required className={inputClass} /></Field>
              <Field label="Company"><input value={companyName} disabled className={`${inputClass} cursor-not-allowed bg-slate-100`} /></Field>
              <Field label="Project Type ID"><input type="number" min="1" value={projectTypeId} onChange={(event) => setProjectTypeId(event.target.value)} className={inputClass} /></Field>
              <Field label="Platform ID"><input type="number" min="1" value={platformId} onChange={(event) => setPlatformId(event.target.value)} className={inputClass} /></Field>
              <Field label="Budget"><input value={budget} onChange={(event) => setBudget(event.target.value)} className={inputClass} /></Field>
              <Field label="Meeting Time"><input value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} placeholder="e.g. 2026-08-27 10:30" className={inputClass} /></Field>
              <Field label="Assigned To"><select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} disabled={loadingUsers} className={inputClass}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>)}</select></Field>
              <Field label="Client Email"><input value={lead.email ?? ''} disabled className={`${inputClass} cursor-not-allowed bg-slate-100`} /></Field>
              <Field label="Contact Email"><input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className={inputClass} /></Field>
              <Field label="Contact Phone"><input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} className={inputClass} /></Field>
              <div className="md:col-span-2"><Field label="Job Description"><textarea value={lead.message ?? ''} disabled rows={4} className={`${inputClass} cursor-not-allowed bg-slate-100`} /></Field></div>
              <div className="md:col-span-2"><Field label="Website URL"><input value={lead.website_url ?? ''} disabled className={`${inputClass} cursor-not-allowed bg-slate-100`} /></Field></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Creating...' : 'Create Deal'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500'

function Field({ label, required = false, children }: { label: string, required?: boolean, children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500"> *</span>}<span className="mt-1.5 block">{children}</span></label>
}

export default DealFromLeadForm
