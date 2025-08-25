// src/events/producers/reservation.producer.ts
import {
  connectRabbit,
  EXCHANGE,
  REMINDER_EXCHANGE,
} from '../../config/rabbitmq'
import {
  ReservationCreatedPayload,
  ReminderPayload,
  ReservationCancelledPayload,
  ReservationConfirmedPayload,
} from '../types'

export async function publishReservationCreated(
  payload: ReservationCreatedPayload
) {
  const ch = await connectRabbit()
  const routingKey = 'reservation.created'
  ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  })
}

export async function publishReservationConfirmed(
  payload: ReservationConfirmedPayload
) {
  const ch = await connectRabbit()
  ch.publish(
    EXCHANGE,
    'reservation.confirmed',
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  )
}

export async function publishReservationCancelled(
  payload: ReservationCancelledPayload
) {
  const ch = await connectRabbit()
  ch.publish(
    EXCHANGE,
    'reservation.cancelled',
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  )
}

/**
 * publishReminderDelayed:
 * - If the broker supports x-delayed-message plugin, it will publish with header x-delay (ms).
 * - Otherwise we create a short-lived TTL queue that dead-letters to REMINDER_EXCHANGE -> 'reservation.reminder' routing key.
 */
export async function publishReminderDelayed(
  payload: ReminderPayload,
  delayMs: number
) {
  const ch = await connectRabbit()
  const useXDelayed = (process.env.USE_X_DELAYED || 'false') === 'true'

  if (useXDelayed) {
    // publish directly to REMINDER_EXCHANGE with header x-delay
    ch.publish(
      REMINDER_EXCHANGE,
      'reservation.reminder',
      Buffer.from(JSON.stringify(payload)),
      {
        headers: { 'x-delay': delayMs },
        persistent: true,
      }
    )
    return
  }

  // Fallback: create a temporary TTL queue that DLX -> REMINDER_EXCHANGE with routing 'reservation.reminder'
  const tmpQueue = `reminder_ttl_${Date.now()}_${Math.floor(
    Math.random() * 10000
  )}`
  const dlxArgs = {
    durable: true,
    arguments: {
      'x-message-ttl': delayMs,
      'x-dead-letter-exchange': REMINDER_EXCHANGE,
      'x-dead-letter-routing-key': 'reservation.reminder',
    },
  }
  await ch.assertQueue(tmpQueue, dlxArgs)
  // publish a message into the tmp queue (to be dead-lettered after TTL)
  ch.sendToQueue(tmpQueue, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  })
}
