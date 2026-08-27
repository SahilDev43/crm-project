export interface DealCreate {
  title: string
  client_name: string
  deal_status_id: number
  company_id: number
  project_type_id?: number | null
  platform_id?: number | null
  platform_external_id?: string | null
  job_description?: string | null
  url?: string | null
  client_email?: string | null
  client_phone?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_description?: string | null
  budget?: string | null
  meeting_time?: string | null
  lead_id?: number | null
  external_lead_id?: string | null
  accepted_by?: number | null
  assigned_to?: number | null
  status_meeting_by_user_id?: number | null
  status?: number
  type?: number
}

export interface Deal extends DealCreate {
  id: number
  created_by: number
  updated_by: number | null
  created_at: string
  updated_at: string
}

export interface DealUpdate {
  title?: string | null
  client_name?: string | null
  deal_status_id?: number | null
  company_id?: number | null
  project_type_id?: number | null
  platform_id?: number | null
  platform_external_id?: string | null
  job_description?: string | null
  url?: string | null
  client_email?: string | null
  client_phone?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_description?: string | null
  budget?: string | null
  meeting_time?: string | null
  lead_id?: number | null
  external_lead_id?: string | null
  accepted_by?: number | null
  assigned_to?: number | null
  status_meeting_by_user_id?: number | null
  status?: number | null
  type?: number | null
}

export interface DealAssign {
  assigned_to: number
}

export interface DealStatusUpdate {
  deal_status_id: number
}

export interface DealStatus {
  id: number
  name: string
  code: string
  is_active: boolean
}

export interface DealMasterData {
  id: number
  name: string
}

export interface DealFeedEntry {
  id: number
  deal_id: number
  user_id: number | null
  actor_name: string | null
  event_type: string
  content: string
  metadata_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface DealListResponse {
  items: Deal[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
