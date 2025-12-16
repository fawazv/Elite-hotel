import { getRabbitChannel } from '../config/rabbitmq.config'
import { ReservationService } from '../services/implementation/reservation.service'
import { ReservationRepository } from '../repository/implementation/reservation.repository'
import { RoomLookupAdapter } from '../services/adapters/roomLookup.adapter'
import { DynamicPricingEngine } from '../services/adapters/dynamicPricingEngine'
import { PaymentOrchestratorAdapter } from '../services/adapters/paymentOrchestrator.adapter'
import { GuestRpcClient } from '../services/adapters/guestRpcClient.adapter'
import logger from '../utils/logger.service'

export async function startPaymentConsumer() {
  const channel = await getRabbitChannel()
  const exchange = 'payments.events'
  const queueName = 'reservation.payment.updates'

  await channel.assertExchange(exchange, 'topic', { durable: true })
  const q = await channel.assertQueue(queueName, { durable: true })
  
  // Bind to payment events
  await channel.bindQueue(q.queue, exchange, 'payment.succeeded')
  await channel.bindQueue(q.queue, exchange, 'payment.failed')
  await channel.bindQueue(q.queue, exchange, 'payment.refunded')

  // Initialize service dependencies
  // Note: ideally these should be injected or singleton
  const repo = new ReservationRepository()
  const roomLookup = new RoomLookupAdapter()
  const pricing = new DynamicPricingEngine()
  const payments = new PaymentOrchestratorAdapter()
  const guestRpc = new GuestRpcClient()
  
  const reservationService = new ReservationService(
    repo,
    roomLookup,
    pricing,
    payments,
    guestRpc
  )

  logger.info('Payment consumer started for ReservationService', {
     queue: q.queue,
     bindings: ['payment.succeeded', 'payment.failed', 'payment.refunded']
  })

  channel.consume(q.queue, async (msg: any) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      const { event, data } = evt
      
      logger.info('ReservationService received payment event', {
        event,
        reservationId: data.reservationId
      })

      if (!data.reservationId) {
          logger.warn('Event missing reservationId, skipping', { event })
          channel.ack(msg)
          return
      }

      switch (event) {
        case 'payment.succeeded':
          try {
            await reservationService.confirm(data.reservationId)
            logger.info('Reservation confirmed via payment event', { reservationId: data.reservationId })
          } catch (err: any) {
             // If already confirmed or checked out, we might get an error, but that's okay.
             logger.warn('Failed to confirm reservation', { reservationId: data.reservationId, error: err.message })
          }
          break
          
        case 'payment.failed':
          // Optional: Could add notes to reservation or trigger alert?
          // Currently we don't auto-cancel on *one* failed attempt because user might retry.
          logger.info('Payment failed for reservation', { reservationId: data.reservationId, error: data.error })
          break
          
        case 'payment.refunded':
          // Optionally cancel? Or just log? 
          // Usually refunds happen AFTER cancellation, so status might already be Cancelled.
          logger.info('Payment refunded for reservation', { reservationId: data.reservationId })
          break
      }

      channel.ack(msg)
    } catch (err: any) {
      logger.error('Error in payment consumer', { error: err.message })
      channel.nack(msg, false, false) 
    }
  })
}
