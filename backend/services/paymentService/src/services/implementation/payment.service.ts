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

  // 💸 Refund method with partial refund support
  async refundPayment(
    paymentId: string,
    refundPercentage: number = 1.0
  ): Promise<PaymentDoc | null> {
    const payment = await this.repo.findById(paymentId)
    if (!payment) throw new Error('Payment not found')

    // 🔒 Idempotency: skip if already refunded
    if (payment.refunded || payment.status === 'refunded') {
      console.log(`Payment ${paymentId} already refunded, skipping.`)
      return payment
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Only succeeded payments can be refunded')
    }

    const refundAmount = Math.floor(payment.amount * refundPercentage)

    let providerResponse: any
    let refundTxId: string = ''

    if (payment.provider === 'stripe') {
      providerResponse = await this.stripe.refunds.create({
        payment_intent: payment.metadata?.stripeId,
        amount: refundAmount * 100,
      })
      refundTxId = providerResponse.id
    } else if (payment.provider === 'razorpay') {
      providerResponse = await this.razorpay.payments.refund(
        payment.metadata?.razorpayPaymentId,
        {
          amount: refundAmount * 100,
        }
      )
      refundTxId = providerResponse.id
    }

    const updated = await this.repo.updateStatus(paymentId, 'refunded', {
      refundAmount,
      refundPercentage,
      providerResponse,
      refunded: true,
      refundTxId,
    })

    if (updated) {
      await this.publishEvent('payment.refunded', {
        paymentId: updated._id.toString(),
        reservationId: updated.reservationId,
        guestId: updated.guestId,
        refundAmount,
        refundPercentage,
        provider: updated.provider,
        refundTxId,
      })
    }

    return updated
  }

  async handleReservationCancelled(
    reservationId: string,
    refundPercentage: number = 0.8
  ) {
    const payments = await this.repo.findByReservation(reservationId)

    if (payments && Array.isArray(payments)) {
      for (const p of payments) {
        if (p.status === 'succeeded' && !p.refunded) {
          await this.refundPayment(p._id.toString(), refundPercentage)
        }
      }
    }
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
