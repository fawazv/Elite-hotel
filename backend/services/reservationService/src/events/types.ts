// src/events/types.ts
export type ReservationCreatedPayload = {
  reservationId: string
  code: string
  guestId: string
  guestContact?: { email?: string; phone?: string }
  checkIn: string // ISO
  checkOut: string // ISO
  totalAmount: number
  currency: string
  source?: string
}

export type ReservationConfirmedPayload = ReservationCreatedPayload & {}

export type ReservationCancelledPayload = {
  reservationId: string
  code: string
  guestId: string
  guestContact?: { email?: string; phone?: string }
  cancelledAt: string // ISO
  reason?: string
}

export type ReminderPayload = {
  reservationId: string
  code: string
  guestId: string
  guestContact?: { email?: string; phone?: string }
  checkIn: string
  when: string // ISO - the reminder's scheduled time
  type: 'PREARRIVAL_24H' | 'PREARRIVAL_2H' | string
}
