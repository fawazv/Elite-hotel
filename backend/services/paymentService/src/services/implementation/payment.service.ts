// src/services/payment.service.ts
import { PaymentRepository } from '../../repository/implementation/payment.repository'
import { getRabbitChannel } from '../../config/rabbitmq.config'
import Stripe from 'stripe'
import Razorpay from 'razorpay'
import { IPaymentService } from '../interface/IPayment.service'
import { PaymentDoc } from '../../models/payment.model'

export class PaymentService implements IPaymentService {
  private repo: PaymentRepository
  private channelP: Promise<any>
  private stripe: Stripe
  private razorpay: Razorpay

  constructor(repo: PaymentRepository) {
    this.repo = repo
    this.channelP = getRabbitChannel()
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
    })
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_SECRET || '',
    })
  }

  async initiatePayment(input: {
    reservationId: string
    guestId: string
    amount: number
    currency: string
    provider: 'stripe' | 'razorpay'
  }): Promise<{ payment: PaymentDoc; providerResponse: any }> {
    const payment = await this.repo.create({
      reservationId: input.reservationId,
      guestId: input.guestId,
      amount: input.amount,
      currency: input.currency,
      provider: input.provider,
      status: 'initiated',
    })

    let providerResponse: any
    if (input.provider === 'stripe') {
      providerResponse = await this.stripe.paymentIntents.create({
        amount: input.amount * 100, // cents
        currency: input.currency,
        metadata: { reservationId: input.reservationId },
      })
      await this.repo.updateStatus(payment._id.toString(), 'initiated', {
        stripeId: providerResponse.id,
      })
    } else {
      providerResponse = await this.razorpay.orders.create({
        amount: input.amount * 100,
        currency: input.currency,
        notes: { reservationId: input.reservationId },
      })
      await this.repo.updateStatus(payment._id.toString(), 'initiated', {
        razorpayOrderId: providerResponse.id,
      })
    }

    await this.publishEvent('payment.initiated', {
      paymentId: payment._id.toString(),
      reservationId: input.reservationId,
      guestId: input.guestId,
      amount: input.amount,
      currency: input.currency,
      provider: input.provider,
      providerResponse,
    })

    return { payment, providerResponse }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: 'succeeded' | 'failed' | 'refunded',
    metadata?: any
  ): Promise<PaymentDoc | null> {
    const updated = await this.repo.updateStatus(paymentId, status, metadata)
    if (updated) {
      await this.publishEvent(`payment.${status}`, {
        paymentId: updated._id.toString(),
        reservationId: updated.reservationId,
        guestId: updated.guestId,
        amount: updated.amount,
        status,
      })
    }
    return updated
  }

  private async publishEvent(event: string, data: any) {
    const ch = await this.channelP
    ch.publish(
      'payments.events',
      event,
      Buffer.from(
        JSON.stringify({ event, data, createdAt: new Date().toISOString() })
      ),
      {
        persistent: true,
      }
    )
  }
}
