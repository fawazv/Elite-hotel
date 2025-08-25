// src/events/rabbitmq/producer.ts (ReservationService)
import { RabbitMQ } from '../../shared/rabbitmq/rabbitmq'
const exchange = process.env.RABBIT_EXCHANGE || 'hotel.events'
const rabbit = new RabbitMQ()

export async function initProducer() {
  await rabbit.connect()
  await rabbit.assertExchange(exchange, 'topic', { durable: true })
}

export async function publishReservationEvent(
  type:
    | 'reservation.created'
    | 'reservation.confirmed'
    | 'reservation.cancelled',
  payload: any
) {
  // payload should include reservationId, code, guestId, guestContact, checkIn, checkOut, totalAmount, createdAt etc
  const message = {
    event: type,
    data: payload,
    createdAt: new Date().toISOString(),
    messageId: payload?.code || `${payload?.reservationId || ''}-${Date.now()}`,
  }
  // publish as persistent message
  await rabbit.publish(exchange, type, message, { persistent: true })
}
