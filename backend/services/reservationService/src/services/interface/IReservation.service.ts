// src/services/interface/IReservation.service.ts
import { ReservationDocument } from '../../models/reservation.model'

export type QuoteRequest = {
  roomId: string
  checkIn: Date
  checkOut: Date
  adults?: number
  children?: number
  currency?: string
  promoCode?: string
}

export type CreateReservationInput = {
  guestId: string
  roomId: string
  checkIn: Date | string
  checkOut: Date | string
  adults: number
  children?: number
  notes?: string
  source?: 'Online' | 'FrontDesk' | 'OTA'
  requiresPrepayment?: boolean
  paymentProvider?: 'Stripe' | 'Razorpay'
  currency?: string
}

export interface IRoomLookupService {
  ensureRoomExists(
    roomId: string
  ): Promise<{ id: string; price: number; available?: boolean }>
}

export interface IPaymentOrchestrator {
  createPaymentIntent(params: {
    provider: 'Stripe' | 'Razorpay'
    amount: number
    currency: string
    reservationCode: string
    customer: { guestId: string }
    metadata?: Record<string, any>
  }): Promise<{
    id: string
    clientSecret?: string
    provider: 'Stripe' | 'Razorpay'
    extra?: any
  }>
}

export interface IReservationService {
  quote(
    input: QuoteRequest,
    jwtToken?: string
  ): Promise<{
    baseRate: number
    taxes: number
    fees: number
    total: number
    currency: string
  }>
  create(
    input: CreateReservationInput,
    createdBy?: string,
    jwtToken?: string
  ): Promise<
    ReservationDocument & { paymentClientSecret?: string; paymentOrder?: any }
  >
  createPublic(
    input: CreateReservationInput
  ): Promise<
    ReservationDocument & { paymentClientSecret?: string; paymentOrder?: any }
  >
  getById(id: string): Promise<ReservationDocument | null>
  getByCode(code: string): Promise<ReservationDocument | null>
  list(q: {
    page?: number
    limit?: number
    status?: string
    guestId?: string
    roomId?: string
    dateFrom?: Date
    dateTo?: Date
    search?: string
    sort?: Array<{ column: string; direction: 'asc' | 'desc' }>
  }): Promise<{
    data: ReservationDocument[]
    total: number
    page: number
    limit: number
  }>
  patch(
    id: string,
    payload: Partial<ReservationDocument>
  ): Promise<ReservationDocument | null>

  confirm(id: string): Promise<ReservationDocument>
  cancel(id: string, reason?: string): Promise<ReservationDocument>
  checkIn(id: string): Promise<ReservationDocument>
  checkOut(id: string): Promise<ReservationDocument>
}
