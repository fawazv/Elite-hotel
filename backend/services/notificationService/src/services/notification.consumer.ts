// notification-service/src/services/notification.consumer.ts
import { ConsumeMessage } from 'amqplib'
import { getRabbitChannel, initTopology } from '../config/rabbitmq.config'
import { EmailService } from './email.service'
import { SmsService } from './sms.service'
import dayjs from 'dayjs'
import {
  handleInvoiceCreated,
  handleInvoiceRefunded,
} from './notification.billing'
import logger from '../utils/logger.service'

const EMAIL = new EmailService()
const SMS = new SmsService()

export async function startNotificationConsumer() {
  await initTopology()
  const ch = await getRabbitChannel()

  logger.info('Notification consumer started', { queue: 'notifications.queue' })

  // ensure the notifications.queue is asserted in initTopology()
  await ch.consume(
    'notifications.queue',
    async (msg: ConsumeMessage | null) => {
      if (!msg) return
      try {
        const evt = JSON.parse(msg.content.toString())
        const routingKey = msg.fields.routingKey

        logger.info('Notification event received', {
          event: evt.event,
          routingKey,
        })

        // route handling
        if (evt.event === 'reservation.created') {
          await handleReservationCreated(evt.data)
        } else if (evt.event === 'reservation.cancelled') {
          await handleReservationCancelled(evt.data)
        } else if (evt.event === 'reservation.notification') {
          // TTL-based delayed notification — handle reminder
          await handleReminder(evt.data)
        } else if (evt.event === 'billing.invoice.created') {
          await handleInvoiceCreated(evt.data)
        } else if (evt.event === 'billing.invoice.refunded') {
          await handleInvoiceRefunded(evt.data)
        } else if (evt.event === 'payment.succeeded') {
          await handlePaymentSucceeded(evt.data)
        } else if (evt.event === 'payment.failed') {
          await handlePaymentFailed(evt.data)
        } else {
          logger.debug('Unhandled notification event', { event: evt.event })
        }

        ch.ack(msg)
      } catch (err) {
        logger.error('Notification handler error', {
          error: (err as Error).message,
          stack: (err as Error).stack,
        })
        ch.nack(msg, false, false) // discard or move to DLQ in production
      }
    },
    { noAck: false }
  )
}

async function handleReservationCreated(data: any) {
  logger.info('Handling reservation.created notification', {
    reservationId: data.reservationId,
    code: data.code,
  })

  // send immediate confirmation
  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Booking Confirmed — ${data.code}`
  const text = `Hi — your reservation ${data.code} for ${data.checkIn} → ${data.checkOut} is confirmed. Total: ${data.totalAmount} ${data.currency}`

  // ✅ Handle errors gracefully - one failure doesn't block the other
  if (toEmail) {
    try {
      await EMAIL.sendMail({ to: toEmail, subject, text })
    } catch (err) {
      logger.error('Failed to send confirmation email', {
        reservationId: data.reservationId,
        email: toEmail,
        error: (err as Error).message,
      })
    }
  }

  if (toPhone) {
    try {
      await SMS.sendSms({ to: toPhone, body: text })
    } catch (err) {
      logger.error('Failed to send confirmation SMS', {
        reservationId: data.reservationId,
        phone: toPhone,
        error: (err as Error).message,
      })
    }
  }

  // schedule a reminder 24 hours before check-in (example). Calculate delay in ms.
  const checkIn = new Date(data.checkIn)
  const reminderAt = dayjs(checkIn).subtract(24, 'hour')
  const now = dayjs()
  const delayMs = Math.max(reminderAt.diff(now), 0)

  logger.info('Scheduling pre-checkin reminder', {
    reservationId: data.reservationId,
    checkIn: data.checkIn,
    reminderAt: reminderAt.toISOString(),
    delayMs,
  })

  // Build reminder payload (kind: pre-checkin reminder)
  const reminderPayload = {
    event: 'reservation.notification',
    data: {
      type: 'precheckin-reminder',
      reservationId: data.reservationId,
      code: data.code,
      guestId: data.guestId,
      guestContact: data.guestContact,
      checkIn: data.checkIn,
    },
    createdAt: new Date().toISOString(),
  }

  // publish to delayed queue with TTL equal to delayMs.
  // If delayMs = 0 (reminder time passed), publish immediately to events exchange for immediate processing.
  const ch = await getRabbitChannel()
  if (delayMs <= 0) {
    // immediate publish to events exchange so the consumer will pick it from notifications.queue.
    ch.publish(
      'reservations.events',
      'reservation.notification',
      Buffer.from(JSON.stringify(reminderPayload)),
      { persistent: true }
    )
    logger.debug('Published immediate reminder (check-in already passed)')
  } else {
    // send to delayed queue with per-message expiration
    ch.sendToQueue(
      'notifications.delayed',
      Buffer.from(JSON.stringify(reminderPayload)),
      {
        expiration: String(delayMs),
        persistent: true,
      }
    )
    logger.debug('Scheduled delayed reminder', { delayMs })
  }
}

async function handleReservationCancelled(data: any) {
  logger.info('Handling reservation.cancelled notification', {
    reservationId: data.reservationId,
    code: data.code,
  })

  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Booking Cancelled — ${data.code}`
  const text = `Your reservation ${data.code} has been cancelled.`

  if (toEmail) {
    try {
      await EMAIL.sendMail({ to: toEmail, subject, text })
    } catch (err) {
      logger.error('Failed to send cancellation email', {
        reservationId: data.reservationId,
        error: (err as Error).message,
      })
    }
  }

  if (toPhone) {
    try {
      await SMS.sendSms({ to: toPhone, body: text })
    } catch (err) {
      logger.error('Failed to send cancellation SMS', {
        reservationId: data.reservationId,
        error: (err as Error).message,
      })
    }
  }
}

async function handleReminder(data: any) {
  logger.info('Handling pre-checkin reminder', {
    reservationId: data.reservationId,
    type: data.type,
  })

  // Handle reminder messages (pre-checkin)
  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Reminder: Upcoming Stay ${data.code}`
  const text = `Reminder: your check-in for ${data.code} is on ${data.checkIn}. If you need to change, contact us.`

  if (toEmail) {
    try {
      await EMAIL.sendMail({ to: toEmail, subject, text })
    } catch (err) {
      logger.error('Failed to send reminder email', {
        reservationId: data.reservationId,
        error: (err as Error).message,
      })
    }
  }

  if (toPhone) {
    try {
      await SMS.sendSms({ to: toPhone, body: text })
    } catch (err) {
      logger.error('Failed to send reminder SMS', {
        reservationId: data.reservationId,
        error: (err as Error).message,
      })
    }
  }
}

async function handlePaymentSucceeded(data: any) {
  logger.info('Handling payment.succeeded notification', {
    paymentId: data.paymentId,
  })

  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Payment Successful`
  const text = `Your payment of ${data.amount} has been processed successfully for reservation. Thank you!`

  if (toEmail) {
    try {
      await EMAIL.sendMail({ to: toEmail, subject, text })
    } catch (err) {
      logger.error('Failed to send payment success email', {
        paymentId: data.paymentId,
        error: (err as Error).message,
      })
    }
  }

  if (toPhone) {
    try {
      await SMS.sendSms({ to: toPhone, body: text })
    } catch (err) {
      logger.error('Failed to send payment success SMS', {
        paymentId: data.paymentId,
        error: (err as Error).message,
      })
    }
  }
}

async function handlePaymentFailed(data: any) {
  logger.info('Handling payment.failed notification', {
    paymentId: data.paymentId,
  })

  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Payment Failed`
  const text = `Your payment attempt failed. Please try again or contact support for assistance.`

  if (toEmail) {
    try {
      await EMAIL.sendMail({ to: toEmail, subject, text })
    } catch (err) {
      logger.error('Failed to send payment failure email', {
        paymentId: data.paymentId,
        error: (err as Error).message,
      })
    }
  }

  if (toPhone) {
    try {
      await SMS.sendSms({ to: toPhone, body: text })
    } catch (err) {
      logger.error('Failed to send payment failure SMS', {
        paymentId: data.paymentId,
        error: (err as Error).message,
      })
    }
  }
}
