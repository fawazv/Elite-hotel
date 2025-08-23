// src/repository/implementation/guest.repository.ts
import { BaseRepository } from './base.repository'
import { IGuestRepository } from '../interface/IGuest.repository'
import { Guest, GuestDocument } from '../../models/guest.model'

export class GuestRepository
  extends BaseRepository<GuestDocument>
  implements IGuestRepository
{
  constructor() {
    super(Guest)
  }

  findByEmail(email: string) {
    return this.model.findOne({ email }).exec()
  }

  findByPhone(phoneNumber: string) {
    return this.model.findOne({ phoneNumber }).exec()
  }

  findByEmailOrPhone(email?: string, phoneNumber?: string) {
    const or: any[] = []
    if (email) or.push({ email })
    if (phoneNumber) or.push({ phoneNumber })
    if (!or.length) return Promise.resolve(null)
    return this.model.findOne({ $or: or }).exec()
  }
}
