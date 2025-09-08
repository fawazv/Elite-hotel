// src/consumers/reservation.consumer.ts
import { getRabbitChannel, initTopology } from '../config/rabbitmq.config'
import { PaymentService } from '../services/implementation/payment.service'
import { PaymentRepository } from '../repository/implementation/payment.repository'

export async function startReservationConsumer() {
  await initTopology()
  const ch = await getRabbitChannel()
  const repo = new PaymentRepository()
  const svc = new PaymentService(repo)

  await ch.consume('reservations.queue.forPayments', async (msg) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      if (evt.event === 'reservation.created') {
        const { reservationId, guestId, totalAmount, currency } = evt.data
        await svc.initiatePayment({
          reservationId,
          guestId,
          amount: totalAmount,
          currency,
          provider: process.env.DEFAULT_PAYMENT_PROVIDER as
            | 'stripe'
            | 'razorpay',
        })
      }
      ch.ack(msg)
    } catch (err) {
      console.error('Reservation consumer error', err)
      ch.nack(msg, false, false)
    }
  })
}
