import mongoose, { Schema } from 'mongoose'
import { IRoomDocument } from '../interfaces/IRoom.interface'

const RoomSchema = new Schema<IRoomDocument>(
  {
    roomId: { type: Number, index: true, unique: true, sparse: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    amenities: { type: [String], default: [] },
    size: { type: String },
    capacity: { type: String },
    rating: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
)

RoomSchema.index({ name: 'text', description: 'text' })

export const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema)
