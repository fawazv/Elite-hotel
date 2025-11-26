// src/consumers/reservation.consumer.ts
import { getRabbitChannel, initTopology } from '../config/rabbitmq.config'
import { PaymentService } from '../services/implementation/payment.service'
import { PaymentRepository } from '../repository/implementation/payment.repository'
import logger from '../utils/logger.service'

export async function startReservationConsumer() {
  await initTopology()
  const ch = await getRabbitChannel()
  const repo = new PaymentRepository()
  const svc = new PaymentService(repo)

  logger.info('Starting reservation consumer')

  await ch.consume('reservations.queue.forPayments', async (msg) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      
      if (evt.event === 'reservation.created') {
        const { reservationId, guestId, guestContact, totalAmount, currency } = evt.data
        
        logger.info('Processing reservation.created event', {
          reservationId,
          amount: totalAmount,
        })

        await svc.initiatePayment({
          reservationId,
          guestId,
          guestContact, // ✅ Pass guestContact to initiatePayment
          amount: totalAmount,
          currency,
          provider: process.env.DEFAULT_PAYMENT_PROVIDER as
            | 'stripe'
            | 'razorpay',
        })
      }
      ch.ack(msg)
    } catch (err) {
      logger.error('Reservation consumer error', {
        error: (err as Error).message,
        stack: (err as Error).stack,
      })
      ch.nack(msg, false, false)
    }
  })
}
