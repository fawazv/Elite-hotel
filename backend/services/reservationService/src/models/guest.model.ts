// src/models/guest.model.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface GuestDocument extends Document {
  fullName: string
  email?: string
  phoneNumber?: string
  address?: string
}

const GuestSchema = new Schema<GuestDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
  },
  { timestamps: true }
)

export const Guest = mongoose.model<GuestDocument>('Guest', GuestSchema)
