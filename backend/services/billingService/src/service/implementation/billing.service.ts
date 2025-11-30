// src/services/implementation/billing.service.ts
import { BillingRepository } from '../../repository/implementation/billing.repository'
import { getRabbitChannel } from '../../config/rabbitmq.config'
import { BillingDoc } from '../../models/billing.model'
import { IBillingService } from '../interface/IBilling.service'
import { getGuestContact } from '../../rpc/guest.rpc.client'
import logger from '../../utils/logger.service'

export class BillingService implements IBillingService {
  private repo: BillingRepository
  private channelP: Promise<any>

  constructor(repo: BillingRepository) {
    this.repo = repo
    this.channelP = getRabbitChannel()
  }

  private async publishEvent(event: string, data: any) {
    try {
      const ch = await this.channelP
      ch.publish(
        'billing.events',
        event,
        Buffer.from(JSON.stringify({ event, data, createdAt: new Date() })),
        { persistent: true }
      )
      logger.debug('Billing event published', { event, invoiceId: data._id })
    } catch (err) {
      logger.error('Failed to publish billing event', {
        event,
        error: (err as Error).message,
      })
    }
  }

  async handlePaymentInitiated(evt: any): Promise<BillingDoc> {
    logger.info('Handling payment.initiated', {
      paymentId: evt.paymentId,
      reservationId: evt.reservationId,
    })

    // ✅ Use guestContact from event if available, otherwise fetch via RPC
    let guestContact = evt.guestContact
    if (!guestContact) {
      try {
        guestContact = await getGuestContact(evt.guestId)
        logger.info('Fetched guest contact via RPC', { guestId: evt.guestId })
      } catch (err) {
        logger.warn('Failed to fetch guest contact for invoice', {
          guestId: evt.guestId,
          error: (err as Error).message,
        })
      }
    } else {
      logger.debug('Using guest contact from event', { guestId: evt.guestId })
    }

    const billing = await this.repo.create({
      paymentId: evt.paymentId,
      reservationId: evt.reservationId,
      guestId: evt.guestId,
      guestContact: guestContact || undefined,
      amount: evt.amount,
      currency: evt.currency,
      status: 'pending',
      ledger: [
        {
          type: 'initiated',
          amount: evt.amount,
          note: 'Payment initiated',
          createdAt: new Date(),
        },
      ],
    })

    logger.info('Invoice created', {
      invoiceId: billing._id.toString(),
      paymentId: evt.paymentId,
      amount: evt.amount,
    })

    await this.publishEvent('billing.invoice.created', billing)
    return billing
  }

  async handlePaymentSucceeded(evt: any): Promise<BillingDoc | null> {
    logger.info('Handling payment.succeeded', { paymentId: evt.paymentId })

    const updated = await this.repo.updateStatus(evt.paymentId, 'paid', {
      type: 'payment',
      amount: evt.amount,
      note: 'Payment succeeded',
    })

    if (updated) {
      logger.info('Invoice marked as paid', {
        invoiceId: updated._id.toString(),
        paymentId: evt.paymentId,
      })
      await this.publishEvent('billing.invoice.paid', updated)
    } else {
      logger.warn('Invoice not found for payment.succeeded', {
        paymentId: evt.paymentId,
      })
    }

    return updated
  }

  async handlePaymentRefunded(evt: any): Promise<BillingDoc | null> {
    logger.info('Handling payment.refunded', {
      paymentId: evt.paymentId,
      refundAmount: evt.refundAmount,
    })

    const updated = await this.repo.updateStatus(evt.paymentId, 'refunded', {
      type: 'refund',
      amount: evt.refundAmount || evt.amount,
      note: `Payment refunded (${evt.refundPercentage * 100}%)`,
    })

    if (updated) {
      logger.info('Invoice marked as refunded', {
        invoiceId: updated._id.toString(),
        paymentId: evt.paymentId,
      })
      await this.publishEvent('billing.invoice.refunded', updated)
    } else {
      logger.warn('Invoice not found for payment.refunded', {
        paymentId: evt.paymentId,
      })
    }

    return updated
  }

  async handlePaymentFailed(evt: any): Promise<BillingDoc | null> {
    logger.info('Handling payment.failed', { paymentId: evt.paymentId })

    const updated = await this.repo.updateStatus(evt.paymentId, 'failed', {
      type: 'failure',
      amount: evt.amount,
      note: 'Payment failed',
    })

    if (updated) {
      logger.info('Invoice marked as failed', {
        invoiceId: updated._id.toString(),
        paymentId: evt.paymentId,
      })
      await this.publishEvent('billing.invoice.failed', updated)
    } else {
      logger.warn('Invoice not found for payment.failed', {
        paymentId: evt.paymentId,
      })
    }

    return updated
  }

  async findAll(filters?: any): Promise<BillingDoc[]> {
    return this.repo.findAll(filters)
  }

  async findById(id: string): Promise<BillingDoc | null> {
    return this.repo.findById(id)
  }

  async findByReservation(reservationId: string): Promise<BillingDoc | null> {
    return this.repo.findByReservation(reservationId)
  }
}
