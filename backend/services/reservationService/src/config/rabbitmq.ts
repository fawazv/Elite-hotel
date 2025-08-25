// src/config/rabbitmq.ts
import amqp, { Connection, Channel, Options } from 'amqplib'
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'hotel_events'
const REMINDER_EXCHANGE =
  process.env.RABBITMQ_REMINDER_EXCHANGE || 'hotel_reminders'

let connection: Connection | null = null
let channel: Channel | null = null

export async function connectRabbit() {
  if (channel) return channel
  connection = await amqp.connect(RABBIT_URL)
  channel = await connection.createChannel()

  // topic exchange for events
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true })

  // exchange specifically for reminders (we might publish delayed messages to this)
  // You can choose 'x-delayed-message' type when plugin available
  const useXDelayed = (process.env.USE_X_DELAYED || 'false') === 'true'
  if (useXDelayed) {
    // 'x-delayed-message' requires plugin; declare with the header
    await channel.assertExchange(REMINDER_EXCHANGE, 'x-delayed-message', {
      durable: true,
      arguments: { 'x-delayed-type': 'topic' },
    } as Options.AssertExchange)
  } else {
    // Normal topic exchange -> we'll use TTL+DLX queues trick
    await channel.assertExchange(REMINDER_EXCHANGE, 'topic', { durable: true })
  }

  // close handlers
  connection.on('close', () => {
    channel = null
    connection = null
  })
  connection.on('error', (err) => {
    console.error('RabbitMQ connection error', err)
  })

  return channel
}

export { EXCHANGE, REMINDER_EXCHANGE }
