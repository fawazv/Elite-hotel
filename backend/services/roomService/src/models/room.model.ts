import { Schema, model, Document } from 'mongoose'
import { IRoom } from '../typings/room.d'

export interface RoomDocument extends IRoom, Document {}

const RoomSchema = new Schema<RoomDocument>(
  {
    number: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Standard', 'Deluxe', 'Premium', 'Luxury'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    description: { type: String },
    amenities: { type: [String], default: [] },
    size: { type: String },
    capacity: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
)

RoomSchema.index({ type: 1, price: 1, available: 1 })

export const Room = model<RoomDocument>('Room', RoomSchema)
