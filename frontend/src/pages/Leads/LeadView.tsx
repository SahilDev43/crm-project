import { X } from 'lucide-react'

import type { Company } from '../../types/company'
import type { Lead } from '../../types/lead'

interface LeadViewProps {
  lead: Lead
  company: Company | undefined
  onClose: () => void
}

function LeadView({ lead, company, onClose }: LeadViewProps) {
  const fields = [
    ['Name', lead.first_name],
    ['Client company', lead.client_company_name],
    ['Company', company?.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Website', lead.website_url],
    ['Status', lead.status?.name],
    ['Source', lead.source],
    ['Industry', lead.industry],
    ['Interest', lead.interested],
    ['Message', lead.message],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Lead Details</h2>
            <p className="mt-1 text-sm text-slate-500">Incoming lead information</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <dl className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default LeadView
