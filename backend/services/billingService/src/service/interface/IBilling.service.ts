// src/services/interfaces/billing.service.interface.ts
import { BillingDoc } from '../../models/billing.model'

export interface IBillingService {
  generateInvoice(input: {
    reservationId: string
    guestId: string
    items: { description: string; amount: number }[]
    currency: string
  }): Promise<BillingDoc>

  markPaid(
    invoiceId: string,
    paymentId: string,
    amount: number
  ): Promise<BillingDoc | null>

  applyRefund(
    invoiceId: string,
    paymentId: string,
    amount: number
  ): Promise<BillingDoc | null>
}
