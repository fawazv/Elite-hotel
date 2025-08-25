// src/config/rabbitmq.config.ts
import amqplib, { Connection, Channel, Options } from 'amqplib'

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let connection: Connection | null = null
let channel: Channel | null = null

export async function getRabbitConnection(): Promise<Connection> {
  if (connection) return connection
  connection = await amqplib.connect(RABBIT_URL)
  connection.on('error', (err) =>
    console.error('RabbitMQ connection error', err)
  )
  connection.on('close', () => {
    console.warn('RabbitMQ connection closed')
    connection = null
  })
  return connection
}

export async function getRabbitChannel(): Promise<Channel> {
  if (channel) return channel
  const conn = await getRabbitConnection()
  channel = await conn.createChannel()
  channel.on('error', (err) => console.error('RabbitMQ channel error', err))
  channel.on('close', () => {
    console.warn('RabbitMQ channel closed')
    channel = null
  })
  return channel
}

/**
 * Initialize top-level topology used across services.
 * Call once at service startup.
 */
export async function initTopology(): Promise<void> {
  const ch = await getRabbitChannel()

  // Event exchange for reservation lifecycle events
  await ch.assertExchange('reservations.events', 'topic', { durable: true })

  // Notifications queue (consumers pick up messages here)
  await ch.assertQueue('notifications.queue', { durable: true })
  await ch.bindQueue(
    'notifications.queue',
    'reservations.events',
    'reservation.*'
  )

  // RPC queue for guest service responses (guest-service will assert it)
  // We do not assert RPC queues here because RPC server must create its own queue.
  // But we keep a durable queue name convention: 'guest.service.rpc'
  // NOTE: RPC uses direct replyTo pattern or classic reply queues — we'll implement a replyTo + correlationId RPC client.

  // Delayed / scheduled notification queue pattern:
  // We'll create a delayed queue where messages have a TTL and DLX to notifications queue.
  await ch.assertExchange('notifications.dlx', 'direct', { durable: true })
  await ch.assertQueue('notifications.delayed', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'reservations.events', // dead-letter to our events exchange
      'x-dead-letter-routing-key': 'reservation.notification', // appropriate routing key
    },
  })
  // We won't bind delayed queue to exchange; producers will publish directly to the queue (via default exchange)
}
