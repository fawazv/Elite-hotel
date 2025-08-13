import { IRoomService, ListQuery } from '../interface/IRoom.service'
import { IRoomRepository } from '../../repository/interface/IRoom.repository'
import CustomError from '../../utils/CustomError'
import { HttpStatus } from '../../enums/http.status'
import { RoomDocument } from '../../models/room.model'

export class RoomService implements IRoomService {
  private roomRepository: IRoomRepository
  constructor(roomRepository: IRoomRepository) {
    this.roomRepository = roomRepository
  }

  async createRoom(payload: Partial<RoomDocument>) {
    if (payload.number == null)
      throw new CustomError('Room number required', HttpStatus.BAD_REQUEST)
    const exists = await this.roomRepository.findByNumber(
      payload.number as number
    )
    if (exists)
      throw new CustomError('Room number already exists', HttpStatus.CONFLICT)
    return this.roomRepository.create(payload)
  }

  getRoomById(id: string) {
    return this.roomRepository.findById(id)
  }

  async listRooms(query: ListQuery) {
    const {
      page = 1,
      limit = 20,
      type,
      minPrice,
      maxPrice,
      available,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = query

    const filter: any = {}
    if (type) filter.type = type
    if (available !== undefined) filter.available = available
    if (minPrice != null || maxPrice != null) {
      filter.price = {}
      if (minPrice != null) filter.price.$gte = minPrice
      if (maxPrice != null) filter.price.$lte = maxPrice
    }
    if (search) filter.name = { $regex: search, $options: 'i' }

    const skip = (page - 1) * limit
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const [data, total] = await Promise.all([
      this.roomRepository.findAll(filter, { skip, limit, sort }),
      this.roomRepository.count(filter),
    ])
    return { data, total, page, limit }
  }

  async patchRoom(id: string, payload: Partial<RoomDocument>) {
    const existing = await this.roomRepository.findById(id)
    if (!existing) throw new CustomError('Room not found', HttpStatus.NOT_FOUND)
    return this.roomRepository.patch(id, payload)
  }

  async deleteRoom(id: string) {
    const existing = await this.roomRepository.findById(id)
    if (!existing) throw new CustomError('Room not found', HttpStatus.NOT_FOUND)
    return this.roomRepository.delete(id)
  }
}
