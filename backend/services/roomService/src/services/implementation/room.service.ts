import { IRoomService } from '../interface/IRoom.service'
import { IRoom } from '../../interfaces/IRoom.interface'
import { IRoomRepository } from '../../repository/interface/IRoom.repository'

export class RoomService implements IRoomService {
  private repository: IRoomRepository

  constructor(repository: IRoomRepository) {
    this.repository = repository
  }

  async createRoom(payload: IRoom) {
    if (!payload.name) throw new Error('Name is required')
    if (!payload.type) throw new Error('Type is required')
    if (payload.price === undefined || payload.price <= 0)
      throw new Error('Price must be a positive number')
    const created = await this.repository.create(payload)
    return created
  }

  async getRoomById(id: string) {
    const room = await this.repository.findById(id)
    if (!room) throw new Error('Room not found')
    return room
  }

  async getByNumericId(nid: number) {
    const room = await this.repository.findByNumericId(nid)
    if (!room) throw new Error('Room not found')
    return room
  }

  async updateRoom(id: string, payload: Partial<IRoom>) {
    const updated = await this.repository.updateById(id, payload)
    if (!updated) throw new Error('Room not found or update failed')
    return updated
  }

  async patchRoom(id: string, payload: Partial<IRoom>) {
    const allowed = [
      'price',
      'available',
      'rating',
      'description',
      'amenities',
      'name',
      'image',
    ]
    const sanitized: Partial<IRoom> = {}
    Object.keys(payload).forEach((k) => {
      if (allowed.includes(k)) {
        // @ts-ignore
        sanitized[k] = (payload as any)[k]
      }
    })
    const patched = await this.repository.patchById(id, sanitized)
    if (!patched) throw new Error('Room not found or patch failed')
    return patched
  }

  async deleteRoom(id: string) {
    const deleted = await this.repository.deleteById(id)
    if (!deleted) throw new Error('Room not found or delete failed')
    return deleted
  }

  async listRooms(filters: any) {
    if (
      filters.minPrice &&
      filters.maxPrice &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new Error('minPrice cannot be greater than maxPrice')
    }
    return this.repository.list(filters)
  }
}
