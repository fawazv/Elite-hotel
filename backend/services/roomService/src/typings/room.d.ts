export type RoomType = 'Standard' | 'Deluxe' | 'Premium' | 'Luxury'

export interface IRoom {
  number: number
  name: string
  type: RoomType
  price: number
  image?: string
  description?: string
  amenities: string[]
  size?: string
  capacity?: string
  rating?: number
  available: boolean
  createdAt?: Date
  updatedAt?: Date
}
