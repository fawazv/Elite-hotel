import { Document, ObjectId } from 'mongoose'

interface IUser extends Document {
  _id: ObjectId
  fullName: string
  email: string
  phoneNumber: string
  password: string
  role: 'receptionist' | 'housekeeper' | 'admin'
  isVerified: boolean
  isApproved: 'pending' | 'approved' | 'rejected'
  avatar?: {
    publicId?: string
    url?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

export default IUser
