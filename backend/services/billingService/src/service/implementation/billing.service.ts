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

  async generateInvoice(input: {
    reservationId: string
    guestId: string
    items: { description: string; amount: number }[]
    currency: string
  }): Promise<BillingDoc> {
    const total = input.items.reduce((sum, i) => sum + i.amount, 0)
    const invoice = await this.repo.create({
      reservationId: input.reservationId,
      guestId: input.guestId,
      amount: total,
      currency: input.currency,
      status: 'pending',
      items: input.items,
      payments: [],
      refunds: [],
    })

    await this.publishEvent('invoice.generated', invoice)
    return invoice
  }

  async markPaid(
    invoiceId: string,
    paymentId: string,
    amount: number
  ): Promise<BillingDoc | null> {
    const invoice = await this.repo.update(invoiceId, {
      $push: { payments: { paymentId, amount } },
      status: 'paid',
    } as any)

    if (invoice) await this.publishEvent('invoice.paid', invoice)
    return invoice
  }

  async applyRefund(
    invoiceId: string,
    paymentId: string,
    amount: number
  ): Promise<BillingDoc | null> {
    const invoice = await this.repo.update(invoiceId, {
      $push: { refunds: { paymentId, amount } },
      status: 'refunded',
    } as any)

    if (invoice) await this.publishEvent('invoice.refunded', invoice)
    return invoice
  }

  private async publishEvent(event: string, data: any) {
    const ch = await this.channelP
    ch.publish(
      'billing.events',
      event,
      Buffer.from(
        JSON.stringify({ event, data, createdAt: new Date().toISOString() })
      ),
      { persistent: true }
    )
  }
}
