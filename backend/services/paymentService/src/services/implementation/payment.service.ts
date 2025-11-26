// src/services/payment.service.ts
import { PaymentRepository } from '../../repository/implementation/payment.repository'
import { getRabbitChannel } from '../../config/rabbitmq.config'
import Stripe from 'stripe'
import Razorpay from 'razorpay'
import { IPaymentService } from '../interface/IPayment.service'
import { PaymentDoc } from '../../models/payment.model'
import logger from '../../utils/logger.service'

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

  // 💸 Refund method with partial refund support and retry logic
  async refundPayment(
    paymentId: string,
    refundPercentage: number = 1.0
  ): Promise<PaymentDoc | null> {
    const payment = await this.repo.findById(paymentId)
    if (!payment) {
      logger.error('Payment not found for refund', { paymentId })
      throw new Error('Payment not found')
    }

    // 🔒 Idempotency: skip if already refunded
    if (payment.refunded || payment.status === 'refunded') {
      logger.info('Payment already refunded, skipping', { paymentId })
      return payment
    }

    if (payment.status !== 'succeeded') {
      logger.warn('Cannot refund non-succeeded payment', {
        paymentId,
        status: payment.status,
      })
      throw new Error('Only succeeded payments can be refunded')
    }

    const refundAmount = Math.floor(payment.amount * refundPercentage)

    // ✅ Retry logic for provider API (3 attempts)
    let providerResponse: any
    let refundTxId: string = ''
    let retries = 3

    while (retries > 0) {
      try {
        if (payment.provider === 'stripe') {
          providerResponse = await this.stripe.refunds.create({
            payment_intent: payment.metadata?.stripeId,
            amount: refundAmount * 100,
          })
          refundTxId = providerResponse.id
          logger.info('Stripe refund successful', {
            paymentId,
            refundTxId,
            refundAmount,
          })
          break // Success
        } else if (payment.provider === 'razorpay') {
          providerResponse = await this.razorpay.payments.refund(
            payment.metadata?.razorpayPaymentId,
            {
              amount: refundAmount * 100,
            }
          )
          refundTxId = providerResponse.id
          logger.info('Razorpay refund successful', {
            paymentId,
            refundTxId,
            refundAmount,
          })
          break // Success
        }
      } catch (err) {
        retries--
        logger.warn('Refund attempt failed, retrying', {
          paymentId,
          retriesLeft: retries,
          error: (err as Error).message,
        })

        if (retries === 0) {
          logger.error('Refund failed after all retries', {
            paymentId,
            error: (err as Error).message,
          })
          throw err
        }

        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Update DB only if refund succeeded
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
        guestContact: updated.guestContact, // ✅ Include guestContact
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
    logger.info('Handling reservation cancellation', {
      reservationId,
      refundPercentage,
    })

    const payments = await this.repo.findByReservation(reservationId)

    if (payments && Array.isArray(payments)) {
      for (const p of payments) {
        if (p.status === 'succeeded' && !p.refunded) {
          try {
            await this.refundPayment(p._id.toString(), refundPercentage)
          } catch (err) {
            logger.error('Failed to refund payment for cancelled reservation', {
              paymentId: p._id.toString(),
              reservationId,
              error: (err as Error).message,
            })
            // Continue with other payments even if one fails
          }
        }
      }
    }
  }

  async initiatePayment(input: {
    reservationId: string
    guestId: string
    guestContact?: { email?: string; phoneNumber?: string } // ✅ Added guestContact
    amount: number
    currency: string
    provider: 'stripe' | 'razorpay'
  }): Promise<{ payment: PaymentDoc; providerResponse: any }> {
    logger.info('Initiating payment', {
      reservationId: input.reservationId,
      amount: input.amount,
      provider: input.provider,
    })

    // ✅ Create payment record FIRST to get paymentId
    const payment = await this.repo.create({
      reservationId: input.reservationId,
      guestId: input.guestId,
      guestContact: input.guestContact, // ✅ Store guestContact
      amount: input.amount,
      currency: input.currency,
      provider: input.provider,
      status: 'initiated',
    })

    const paymentId = payment._id.toString()

    try {
      let providerResponse: any

      if (input.provider === 'stripe') {
        // ✅ Include paymentId in metadata (critical for webhooks!)
        providerResponse = await this.stripe.paymentIntents.create({
          amount: input.amount * 100, // cents
          currency: input.currency,
          metadata: {
            reservationId: input.reservationId,
            paymentId, // ✅ Now webhooks can find payment by this ID
          },
        })

        await this.repo.updateStatus(paymentId, 'initiated', {
          stripeId: providerResponse.id,
        })

        logger.info('Stripe payment intent created', {
          paymentId,
          intentId: providerResponse.id,
        })
      } else {
        // ✅ Include paymentId in notes for Razorpay
        providerResponse = await this.razorpay.orders.create({
          amount: input.amount * 100,
          currency: input.currency,
          notes: {
            reservationId: input.reservationId,
            paymentId, // ✅ Now webhooks can find payment by this ID
          },
        })

        await this.repo.updateStatus(paymentId, 'initiated', {
          razorpayOrderId: providerResponse.id,
        })

        logger.info('Razorpay order created', {
          paymentId,
          orderId: providerResponse.id,
        })
      }

      await this.publishEvent('payment.initiated', {
        paymentId,
        reservationId: input.reservationId,
        guestId: input.guestId,
        guestContact: input.guestContact, // ✅ Include guestContact
        amount: input.amount,
        currency: input.currency,
        provider: input.provider,
        providerResponse,
      })

      return { payment, providerResponse }
    } catch (err) {
      // ✅ If provider API fails, mark payment as failed
      logger.error('Payment initiation failed', {
        error: (err as Error).message,
        paymentId,
        provider: input.provider,
      })

      await this.repo.updateStatus(paymentId, 'failed', {
        error: (err as Error).message,
      })

      throw err
    }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: 'succeeded' | 'failed' | 'refunded',
    metadata?: any
  ): Promise<PaymentDoc | null> {
    logger.info('Updating payment status', { paymentId, status })

    const updated = await this.repo.updateStatus(paymentId, status, metadata)
    
    if (updated) {
      await this.publishEvent(`payment.${status}`, {
        paymentId: updated._id.toString(),
        reservationId: updated.reservationId,
        guestId: updated.guestId,
        guestContact: updated.guestContact, // ✅ Include guestContact
        amount: updated.amount,
        status,
      })

      logger.info('Payment status updated and event published', {
        paymentId,
        status,
      })
    } else {
      logger.warn('Payment not found for status update', { paymentId })
    }

    return updated
  }

  private async publishEvent(event: string, data: any) {
    try {
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
      logger.debug('Event published', { event, paymentId: data.paymentId })
    } catch (err) {
      logger.error('Failed to publish event', {
        event,
        error: (err as Error).message,
      })
    }
  }
}
