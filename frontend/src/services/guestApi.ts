import { privateApi } from '@/services/instances/axiosConfig'

export interface Guest {
  _id: string
  firstName: string
  lastName?: string
  email?: string
  phoneNumber: string
  isBlacklisted: boolean
  status: 'Standard' | 'VIP' | 'Loyalty'
  isIdVerified: boolean
  lastVisit?: string
  createdAt?: string
  idProof?: {
    type?: string
    number?: string
    image?: {
      url: string
    }
  }
  preferences?: {
    smoking?: boolean
    roomType?: string
    bedType?: string
    notes?: string
  }
  notes?: string
}

export interface GuestListResponse {
  data: Guest[]
  total: number
  page: number
  limit: number
}

export const fetchGuests = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  isBlacklisted?: boolean
): Promise<GuestListResponse> => {
  const params: any = { page, limit }
  if (search) params.search = search
  if (isBlacklisted !== undefined) params.isBlacklisted = isBlacklisted

  const response = await privateApi.get('/guests', { params })
  // Backend returns: { success, message, data: [...], total, page, limit }
  return {
    data: response.data.data || [],
    total: response.data.total || 0,
    page: response.data.page || 1,
    limit: response.data.limit || 20
  }
}

export const fetchGuestById = async (id: string): Promise<Guest> => {
  const response = await privateApi.get(`/guests/${id}`)
  return response.data.data || response.data
}

export const createGuest = async (data: Partial<Guest> | FormData): Promise<Guest> => {
  const response = await privateApi.post('/guests', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  })
  return response.data.data || response.data
}

export const updateGuest = async (id: string, data: Partial<Guest>): Promise<Guest> => {
  const response = await privateApi.patch(`/guests/${id}`, data)
  return response.data.data || response.data
}

export const deleteGuest = async (id: string): Promise<void> => {
  await privateApi.delete(`/guests/${id}`)
}
