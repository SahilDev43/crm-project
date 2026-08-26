import apiClient from './client'

import type {
  Lead,
  LeadCreate,
  LeadUpdate,
  LeadStatus,
} from '../types/lead'

export const getLeadStatuses = async (): Promise<LeadStatus[]> => {
  const response = await apiClient.get<LeadStatus[]>(
    '/leads/statuses'
  )

  return response.data
}

export const getLeads = async (): Promise<Lead[]> => {
  const response = await apiClient.get<Lead[]>(
    '/leads'
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

export const createLead = async (
  data: LeadCreate
): Promise<Lead> => {
  const response = await apiClient.post<Lead>(
    '/leads',
    data
  )

  return response.data
}

export const updateLead = async (
  leadId: number,
  data: LeadUpdate
): Promise<Lead> => {
  const response = await apiClient.patch<Lead>(
    `/leads/${leadId}`,
    data
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