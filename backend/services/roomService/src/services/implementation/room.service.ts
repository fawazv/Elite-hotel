import { IRoomService, ListQuery } from '../interface/IRoom.service'
import { IRoomRepository } from '../../repository/interface/IRoom.repository'
import CustomError from '../../utils/CustomError'
import { HttpStatus } from '../../enums/http.status'
import { RoomDocument } from '../../models/room.model'
import { IMediaService } from '../interface/IMedia.service'

export class RoomService implements IRoomService {
  private roomRepository: IRoomRepository
  private mediaService: IMediaService

  constructor(roomRepository: IRoomRepository, mediaService: IMediaService) {
    this.roomRepository = roomRepository
    this.mediaService = mediaService
  }

  private coerceBody(payload: any): any {
    // Handle amenities sent as stringified JSON or comma-separated
    if (typeof payload.amenities === 'string') {
      try {
        const parsed = JSON.parse(payload.amenities)
        if (Array.isArray(parsed)) payload.amenities = parsed
      } catch {
        payload.amenities = payload.amenities
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      }
    }
    if (payload.number) payload.number = Number(payload.number)
    if (payload.price) payload.price = Number(payload.price)
    if (payload.rating) payload.rating = Number(payload.rating)
    if (payload.available != null)
      payload.available = ['true', '1', true, 1].includes(payload.available)
    return payload
  }

  async createRoom(payload: Partial<RoomDocument>, file?: Express.Multer.File) {
    payload = this.coerceBody(payload)

    if (payload.number == null)
      throw new CustomError('Room number required', HttpStatus.BAD_REQUEST)
    const exists = await this.roomRepository.findByNumber(
      payload.number as number
    )
    if (exists)
      throw new CustomError('Room number already exists', HttpStatus.CONFLICT)

    if (file) {
      const uploaded = await this.mediaService.uploadImage(
        file.buffer,
        file.originalname
      )
      ;(payload as any).image = {
        publicId: uploaded.publicId,
        url: uploaded.url,
      }
    }

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

  async patchRoom(
    id: string,
    payload: Partial<RoomDocument>,
    file?: Express.Multer.File
  ) {
    payload = this.coerceBody(payload)
    const existing = await this.roomRepository.findById(id)
    if (!existing) throw new CustomError('Room not found', HttpStatus.NOT_FOUND)

    if (file) {
      if (existing.image?.publicId) {
        await this.mediaService.deleteImage(existing.image.publicId)
      }
      const uploaded = await this.mediaService.uploadImage(
        file.buffer,
        file.originalname
      )
      ;(payload as any).image = {
        publicId: uploaded.publicId,
        url: uploaded.url,
      }
    }

    return this.roomRepository.patch(id, payload)
  }

  async deleteRoom(id: string): Promise<void> {
    const existing = await this.roomRepository.findById(id)
    if (!existing) throw new CustomError('Room not found', HttpStatus.NOT_FOUND)

    if (existing.image?.publicId) {
      await this.mediaService.deleteImage(existing.image.publicId)
    }
    await this.roomRepository.delete(id)
  }
}
