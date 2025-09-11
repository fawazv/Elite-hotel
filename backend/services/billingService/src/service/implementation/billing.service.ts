// src/services/implementation/billing.service.ts
import { BillingRepository } from '../../repository/implementation/billing.repository'
import { getRabbitChannel } from '../../config/rabbitmq.config'
import { BillingDoc } from '../../models/billing.model'
import { IBillingService } from '../interface/IBilling.service'

export class BillingService implements IBillingService {
  private repo: BillingRepository
  private channelP: Promise<any>

  constructor(repo: BillingRepository) {
    this.repo = repo
    this.channelP = getRabbitChannel()
  }

  private async publishEvent(event: string, data: any) {
    const ch = await this.channelP
    ch.publish(
      'billing.events',
      event,
      Buffer.from(JSON.stringify({ event, data, createdAt: new Date() })),
      { persistent: true }
    )
  }

  async handlePaymentInitiated(evt: any): Promise<BillingDoc> {
    const billing = await this.repo.create({
      paymentId: evt.paymentId,
      reservationId: evt.reservationId,
      guestId: evt.guestId,
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
    await this.publishEvent('billing.invoice.created', billing)
    return billing
  }

  async handlePaymentSucceeded(evt: any): Promise<BillingDoc | null> {
    const updated = await this.repo.updateStatus(evt.paymentId, 'paid', {
      type: 'payment',
      amount: evt.amount,
      note: 'Payment succeeded',
    })
    if (updated) {
      await this.publishEvent('billing.invoice.paid', updated)
    }
    return updated
  }

  async handlePaymentRefunded(evt: any): Promise<BillingDoc | null> {
    const updated = await this.repo.updateStatus(evt.paymentId, 'refunded', {
      type: 'refund',
      amount: evt.amount,
      note: 'Payment refunded',
    })
    if (updated) {
      await this.publishEvent('billing.invoice.refunded', updated)
    }
    return updated
  }

  async handlePaymentFailed(evt: any): Promise<BillingDoc | null> {
    const updated = await this.repo.updateStatus(evt.paymentId, 'failed', {
      type: 'failure',
      amount: evt.amount,
      note: 'Payment failed',
    })
    if (updated) {
      await this.publishEvent('billing.invoice.failed', updated)
    }
    return updated
  }
}
