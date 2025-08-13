import { RoomDocument } from '../../models/room.model'

export type ListQuery = {
  page?: number
  limit?: number
  type?: string
  minPrice?: number
  maxPrice?: number
  available?: boolean
  sortBy?: 'price' | 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
  search?: string // name contains
}

export interface IRoomService {
  createRoom(payload: Partial<RoomDocument>): Promise<RoomDocument>
  getRoomById(id: string): Promise<RoomDocument | null>
  listRooms(query: ListQuery): Promise<{
    data: RoomDocument[]
    total: number
    page: number
    limit: number
  }>
  updateRoom(
    id: string,
    payload: Partial<RoomDocument>
  ): Promise<RoomDocument | null>
  patchRoom(
    id: string,
    payload: Partial<RoomDocument>
  ): Promise<RoomDocument | null>
  deleteRoom(id: string): Promise<RoomDocument | null>
}
