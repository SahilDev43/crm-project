export interface LeadStatus {
  id: number
  name: string
  code: string
  is_active: boolean
}

export interface Lead {
  first_name: string | null
  email: string | null
  phone: string | null
  country_code: string | null
  client_company_name: string | null
  message: string | null
  website_url: string | null
  industry: string | null
  interested: string | null
  skype_whatsapp: string | null
  link: string | null
  first_page: string | null
  pre_page: string | null
  utm_campaign: string | null
  utm_medium: string | null
  utm_source: string | null
  utm_term: string | null
  ip: string | null
  city: string | null
  country: string | null
  lead_type: string | null
  source: string | null
  tag: string | null

  id: number
  external_lead_id: string | null
  company_id: number
  status_id: number | null
  is_converted: boolean
  status: LeadStatus | null
  created_at: string
  updated_at: string
}

export interface LeadListResponse {
  items: Lead[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
