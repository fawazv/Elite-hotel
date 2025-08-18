// src/services/IReservationService.ts
import { Reservation } from '../models/reservation.model'

export interface IReservationService {
  createReservation(payload: any): Promise<Reservation>
  cancelReservation(id: string, cancelledBy?: string): Promise<Reservation>
  getById(id: string): Promise<Reservation>
}
