// src/services/adapters/paymentOrchestrator.adapter.ts
import axios from 'axios'
import { IPaymentOrchestrator } from '../interface/IReservation.service'

export class PaymentOrchestratorAdapter implements IPaymentOrchestrator {
  private baseUrl: string
  constructor(
    baseUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4010'
  ) {
    this.baseUrl = baseUrl
  }
  async createPaymentIntent(params: {
    provider: 'Stripe' | 'Razorpay'
    amount: number
    currency: string
    reservationCode: string
    customer: { guestId: string }
    metadata?: Record<string, any>
  }) {
    // Delegates to PaymentService (to be built next)
    const res = await axios.post(`${this.baseUrl}/payments/intents`, params)
    return res.data?.data // { id, clientSecret?, provider, extra? }
  }
}
