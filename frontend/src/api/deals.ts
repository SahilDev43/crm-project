import apiClient from './client'

import type {
  Deal,
  DealAssign,
  DealCreate,
  DealFeedEntry,
  DealListResponse,
  DealMasterData,
  DealStatus,
  DealStatusUpdate,
  DealUpdate,
} from '../types/deal'

export interface GetDealsParams {
  company_id?: number
  deal_status_id?: number
  platform_id?: number
  project_type_id?: number
  assigned_to?: number
  search?: string
  page?: number
  page_size?: number
}

export const getDeals = async (
  params: GetDealsParams = {}
): Promise<DealListResponse> => {
  const response = await apiClient.get<DealListResponse>(
    '/deals',
    { params }
  )

  return response.data
}

export const getDeal = async (
  dealId: number
): Promise<Deal> => {
  const response = await apiClient.get<Deal>(
    `/deals/${dealId}`
  )

  return response.data
}

export const getDealStatuses = async (): Promise<DealStatus[]> => {
  const response = await apiClient.get<DealStatus[]>('/deals/statuses')

  return response.data
}

export const getDealProjectTypes = async (): Promise<DealMasterData[]> => {
  const response = await apiClient.get<DealMasterData[]>('/deals/project-types')
  return response.data
}

export const getDealPlatforms = async (): Promise<DealMasterData[]> => {
  const response = await apiClient.get<DealMasterData[]>('/deals/platforms')
  return response.data
}

export const getDealFeed = async (
  dealId: number
): Promise<DealFeedEntry[]> => {
  const response = await apiClient.get<DealFeedEntry[]>(
    `/deals/${dealId}/feed`
  )

  return response.data
}

export const addDealComment = async (
  dealId: number,
  content: string
): Promise<Deal> => {
  const response = await apiClient.post<Deal>(
    `/deals/${dealId}/comments`,
    { content }
  )

  return response.data
}

export const createDeal = async (
  data: DealCreate
): Promise<Deal> => {
  const response = await apiClient.post<Deal>(
    '/deals',
    data
  )

  return response.data
}

export const updateDeal = async (
  dealId: number,
  data: DealUpdate
): Promise<Deal> => {
  const response = await apiClient.patch<Deal>(
    `/deals/${dealId}`,
    data
  )

  return response.data
}

export const deleteDeal = async (
  dealId: number
): Promise<void> => {
  await apiClient.delete(`/deals/${dealId}`)
}

export const assignDeal = async (
  dealId: number,
  data: DealAssign
): Promise<Deal> => {
  const response = await apiClient.patch<Deal>(
    `/deals/${dealId}/assign`,
    data
  )

  return response.data
}

export const updateDealStatus = async (
  dealId: number,
  data: DealStatusUpdate
): Promise<Deal> => {
  const response = await apiClient.patch<Deal>(
    `/deals/${dealId}/status`,
    data
  )

  return response.data
}
