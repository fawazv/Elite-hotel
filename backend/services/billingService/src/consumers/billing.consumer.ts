import { getRabbitChannel } from '../config/rabbitmq.config'
import { BillingService } from '../service/implementation/billing.service'

export async function startBillingConsumer(billingService: BillingService) {
  const channel = await getRabbitChannel()
  const exchange = 'payments.events'

  await channel.assertExchange(exchange, 'topic', { durable: true })

  const q = await channel.assertQueue('billing.events', { durable: true })

  // Bind only to payment events
  await channel.bindQueue(q.queue, exchange, 'payment.*')

  channel.consume(q.queue, async (msg) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      console.log('BillingService received:', evt)

      switch (evt.event) {
        case 'payment.initiated':
          await billingService.handlePaymentInitiated(evt.data)
          break
        case 'payment.succeeded':
          await billingService.handlePaymentSucceeded(evt.data)
          break
        case 'payment.refunded':
          await billingService.handlePaymentRefunded(evt.data)
          break
        case 'payment.failed':
          await billingService.handlePaymentFailed(evt.data)
          break
      }

      channel.ack(msg)
    } catch (err) {
      console.error('Error in billing consumer:', err)
      channel.nack(msg, false, false)
    }
  })
}
