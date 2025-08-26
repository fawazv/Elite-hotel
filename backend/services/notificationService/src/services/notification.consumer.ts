// notification-service/src/services/notification.consumer.ts
import { ConsumeMessage } from 'amqplib'
import { getRabbitChannel, initTopology } from '../config/rabbitmq.config'
import { EmailService } from './email.service'
import { SmsService } from './sms.service'
import dayjs from 'dayjs'

const EMAIL = new EmailService()
const SMS = new SmsService()

export async function startNotificationConsumer() {
  await initTopology()
  const ch = await getRabbitChannel()

  // ensure the notifications.queue is asserted in initTopology()
  await ch.consume(
    'notifications.queue',
    async (msg: ConsumeMessage | null) => {
      if (!msg) return
      try {
        const evt = JSON.parse(msg.content.toString())
        const routingKey = msg.fields.routingKey // e.g., reservation.created or reservation.notification (after TTL)
        // route handling
        if (evt.event === 'reservation.created') {
          await handleReservationCreated(evt.data)
        } else if (evt.event === 'reservation.cancelled') {
          await handleReservationCancelled(evt.data)
        } else if (evt.event === 'reservation.notification') {
          // TTL-based delayed notification — handle reminder
          await handleReminder(evt.data)
        }
        ch.ack(msg)
      } catch (err) {
        console.error('Notification handler error', err)
        ch.nack(msg, false, false) // discard or move to DLQ in production
      }
    },
    { noAck: false }
  )
}

async function handleReservationCreated(data: any) {
  // send immediate confirmation
  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Booking Confirmed — ${data.code}`
  const text = `Hi — your reservation ${data.code} for ${data.checkIn} → ${data.checkOut} is confirmed. Total: ${data.totalAmount} ${data.currency}`
  if (toEmail) await EMAIL.sendMail({ to: toEmail, subject, text })
  if (toPhone) await SMS.sendSms({ to: toPhone, body: text })

  // schedule a reminder 24 hours before check-in (example). Calculate delay in ms.
  const checkIn = new Date(data.checkIn)
  const reminderAt = dayjs(checkIn).subtract(24, 'hour')
  const now = dayjs()
  const delayMs = Math.max(reminderAt.diff(now), 0)

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
  }
}

async function handleReservationCancelled(data: any) {
  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Booking Cancelled — ${data.code}`
  const text = `Your reservation ${data.code} has been cancelled.`
  if (toEmail) await EMAIL.sendMail({ to: toEmail, subject, text })
  if (toPhone) await SMS.sendSms({ to: toPhone, body: text })
}

async function handleReminder(data: any) {
  // Handle reminder messages (pre-checkin)
  const toEmail = data.guestContact?.email
  const toPhone = data.guestContact?.phoneNumber
  const subject = `Reminder: Upcoming Stay ${data.code}`
  const text = `Reminder: your check-in for ${data.code} is on ${data.checkIn}. If you need to change, contact us.`
  if (toEmail) await EMAIL.sendMail({ to: toEmail, subject, text })
  if (toPhone) await SMS.sendSms({ to: toPhone, body: text })
}
