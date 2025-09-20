import {
  HousekeepingModel,
  HousekeepingTaskDoc,
} from '../models/housekeeping.model'

export class HousekeepingRepository {
  async create(
    data: Partial<HousekeepingTaskDoc>
  ): Promise<HousekeepingTaskDoc> {
    const item = new HousekeepingModel(data)
    return item.save()
  }

  async findById(id: string): Promise<HousekeepingTaskDoc | null> {
    return HousekeepingModel.findById(id).exec()
  }

  async update(
    id: string,
    update: Partial<HousekeepingTaskDoc>
  ): Promise<HousekeepingTaskDoc | null> {
    return HousekeepingModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  async findPendingByRoom(roomId: string) {
    return HousekeepingModel.find({ roomId, status: 'pending' }).exec()
  }
}
