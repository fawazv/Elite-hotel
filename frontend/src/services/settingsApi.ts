
import { privateApi } from '@/services/instances/axiosConfig'

export interface Setting {
  key: string
  value: any
  category: string
  isPublic: boolean
}

export const fetchSettings = async (category?: string): Promise<Record<string, any>> => {
  const params = category ? { category } : {}
  const response = await privateApi.get('/users/settings', { params })
  return response.data.data
}

export const updateSetting = async (key: string, value: any): Promise<Setting> => {
  const response = await privateApi.put(`/users/settings/${key}`, { value })
  return response.data.data
}

export const initializeSettings = async (): Promise<void> => {
  await privateApi.post('/users/settings/seed')
}
