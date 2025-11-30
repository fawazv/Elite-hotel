// src/services/interface/IPayment.service.ts
import { PaymentDoc } from '../../models/payment.model'

export interface IPaymentService {
  initiatePayment(input: {
    reservationId: string
    guestId: string
    amount: number
    currency: string
    provider: 'stripe' | 'razorpay'
  }): Promise<{ payment: PaymentDoc; providerResponse: any }>

  updatePaymentStatus(
    paymentId: string,
    status: 'succeeded' | 'failed' | 'refunded',
    metadata?: any
  ): Promise<PaymentDoc | null>

  findAll(filters?: any): Promise<PaymentDoc[]>
  findById(id: string): Promise<PaymentDoc | null>
}
