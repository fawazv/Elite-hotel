// src/repositories/reservation.repository.ts
import {
  Reservation,
  ReservationDocument,
} from '../../models/reservation.model'
import mongoose from 'mongoose'
import { IReservationRepository } from '../interfaces/IReservation.repository'

export class ReservationRepository implements IReservationRepository {
  async create(payload: Partial<ReservationDocument>) {
    const doc = new Reservation(payload)
    return doc.save()
  }

  async findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    return Reservation.findById(id).lean()
  }

  async findOverlapping(roomId: string, checkIn: Date, checkOut: Date) {
    return Reservation.findOne({
      roomId,
      status: { $in: ['booked', 'checked_in'] },
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
    }).lean()
  }

  async update(id: string, update: Partial<ReservationDocument>) {
    return Reservation.findByIdAndUpdate(id, update, { new: true })
  }
}
