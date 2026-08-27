import apiClient from './client'

import type {
  Lead,
  LeadListResponse,
  LeadStatus,
} from '../types/lead'

export interface GetLeadsParams {
  company_id?: number
  status_id?: number
  lead_type?: string
  search?: string
  page?: number
  page_size?: number
}

export const getLeadStatuses = async (): Promise<LeadStatus[]> => {
  const response = await apiClient.get<LeadStatus[]>(
    '/leads/statuses'
  )

  return response.data
}

export const getLeads = async (
  params: GetLeadsParams = {}
): Promise<LeadListResponse> => {
  const response = await apiClient.get<LeadListResponse>(
    '/leads',
    { params }
  )

  return response.data
}

export const getLead = async (
  leadId: number
): Promise<Lead> => {
  const response = await apiClient.get<Lead>(
    `/leads/${leadId}`
  )

  return response.data
}

export const deleteLead = async (
  leadId: number
): Promise<void> => {
  await apiClient.delete(
    `/leads/${leadId}`
  )
}
