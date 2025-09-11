// src/consumers/billing.consumer.ts
import { getRabbitChannel } from '../config/rabbitmq.config'
import { BillingService } from '../service/implementation/billing.service'

export async function startBillingConsumer(billingService: BillingService) {
  const channel = await getRabbitChannel()
  const queue = 'payments.events.queue'

  await channel.assertQueue(queue, { durable: true })
  await channel.bindQueue(queue, 'payments.events', '#') // subscribe to all payment events

  channel.consume(queue, async (msg) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      console.log('BillingService received:', evt)

      switch (evt.event) {
        case 'payment.succeeded':
          await billingService.markPaid(
            evt.data.reservationId, // reservationId as invoiceId for now
            evt.data.paymentId,
            evt.data.amount
          )
          break

        case 'payment.refunded':
          await billingService.applyRefund(
            evt.data.reservationId, // reservationId as invoiceId for now
            evt.data.paymentId,
            evt.data.refundAmount
          )
          break
      }

      channel.ack(msg)
    } catch (err) {
      console.error('Billing consumer error:', err)
      channel.nack(msg, false, false)
    }
  })
}
