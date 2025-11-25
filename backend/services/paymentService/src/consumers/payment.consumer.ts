// src/consumers/payment.consumer.ts
import { getRabbitChannel } from '../config/rabbitmq.config'
import { PaymentService } from '../services/implementation/payment.service'

export async function startPaymentConsumer(paymentService: PaymentService) {
  const channel = await getRabbitChannel()
  const queue = 'reservations.queue.forPayments'

  channel.consume(queue, async (msg) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      console.log('PaymentService received:', evt)

      if (evt.event === 'reservation.cancelled') {
        const { reservationId, refundPercentage = 0.8 } = evt.data
        await paymentService.handleReservationCancelled(
          reservationId,
          refundPercentage
        )
      }

      channel.ack(msg)
    } catch (err) {
      console.error('Error in payment consumer:', err)
      channel.nack(msg, false, false) // dead-letter on error
    }
  })
}
