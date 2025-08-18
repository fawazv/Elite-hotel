// src/repositories/interfaces/IReservation.repository.ts
import { ReservationDocument } from '../../models/reservation.model'

export interface IReservationRepository {
  create(payload: Partial<ReservationDocument>): Promise<ReservationDocument>
  findById(id: string): Promise<ReservationDocument | null>
  findOverlapping(
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<ReservationDocument | null>
  update(
    id: string,
    update: Partial<ReservationDocument>
  ): Promise<ReservationDocument | null>
}
