import IUser from '../../interfaces/IUser'
import { User } from '../../models/user.model'
import IUserRepository from '../interface/IUser.repository'
import BaseRepository from './base.repository'

export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email })
    } catch (error) {
      return null
    }
  }

  async findByIdLean(id: string): Promise<IUser | null> {
    return User.findById(id).lean().exec()
  }

  async updateUserField(
    email: string,
    field: string,
    value: string
  ): Promise<IUser | null> {
    const update = { $set: { [field]: value } }
    return await User.findOneAndUpdate({ email }, update, { new: true })
  }

  async findByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    return await User.findOne({ phoneNumber })
  }

  async updateByEmail(
    email: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: updateData }, // $set operator updates specific fields
      { new: true, upsert: false }
    ).lean()

    return updatedUser
  }
}
