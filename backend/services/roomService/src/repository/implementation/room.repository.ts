import { Model } from 'mongoose'
import { RoomModel } from '../../models/room.model'
import { CounterModel } from '../../models/counter.model'
import { IRoom } from '../../interfaces/IRoom.interface'
import { IRoomRepository } from '../../interfaces/IRoom.repository'

export class RoomRepository implements IRoomRepository {
  private model: Model<any>

  constructor(model: Model<any>) {
    this.model = model
  }

  private async getNextNumericId(): Promise<number> {
    const doc = await CounterModel.findByIdAndUpdate(
      { _id: 'roomid' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    )
      .lean()
      .exec()
    return doc.seq
  }

  async create(room: Partial<IRoom>) {
    if (!room.roomId) {
      const next = await this.getNextNumericId()
      room.roomId = next
    }
    const created = await this.model.create(room)
    return created.toObject()
  }

  async findById(id: string) {
    return this.model.findById(id).lean().exec()
  }

  async findByNumericId(nid: number) {
    return this.model.findOne({ id: nid }).lean().exec()
  }

  async updateById(id: string, data: Partial<IRoom>) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean().exec()
  }

  async patchById(id: string, data: Partial<IRoom>) {
    return this.updateById(id, data)
  }

  async deleteById(id: string) {
    return this.model.findByIdAndDelete(id).lean().exec()
  }

  async list(filter: any) {
    const query: any = {}
    if (filter.type) query.type = filter.type
    if (typeof filter.available === 'boolean')
      query.available = filter.available
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {}
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice
    }
    if (filter.q) query.$text = { $search: filter.q }

    const page = Math.max(1, filter.page || 1)
    const limit = Math.min(100, filter.limit || 20)
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit).lean().exec(),
      this.model.countDocuments(query).exec(),
    ])

    return { items, total, page, limit }
  }
}
