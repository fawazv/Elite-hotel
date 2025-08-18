// src/models/reservation.model.ts
import mongoose, { Schema, Document } from 'mongoose'

const GuestSnapshot = new Schema(
  {
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest' },
    fullName: String,
    email: String,
    phoneNumber: String,
  },
  { _id: false }
)

export interface ReservationDocument extends Document {
  guest: any
  roomId: mongoose.Types.ObjectId
  checkIn: Date
  checkOut: Date
  status: 'booked' | 'checked_in' | 'checked_out' | 'cancelled'
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'failed'
  createdBy?: mongoose.Types.ObjectId
}

const ReservationSchema = new Schema<ReservationDocument>(
  {
    guest: GuestSnapshot,
    roomId: { type: Schema.Types.ObjectId, required: true, index: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: {
      type: String,
      enum: ['booked', 'checked_in', 'checked_out', 'cancelled'],
      default: 'booked',
    },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    createdBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
)

ReservationSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 })

export const Reservation = mongoose.model<ReservationDocument>(
  'Reservation',
  ReservationSchema
)
