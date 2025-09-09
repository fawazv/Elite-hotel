// src/config/rabbitmq.config.ts
import amqplib, { Connection, Channel } from 'amqplib'

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let connection: Connection | null = null
let channel: Channel | null = null

export async function getRabbitConnection(): Promise<Connection> {
  while (!connection) {
    try {
      connection = await amqplib.connect(RABBIT_URL)
      console.log('✅ Connected to RabbitMQ')

      connection.on('error', (err) => {
        console.error('❌ RabbitMQ connection error', err)
        connection = null
      })

      connection.on('close', () => {
        console.warn('⚠️ RabbitMQ connection closed, retrying...')
        connection = null
      })
    } catch (err) {
      console.error('❌ Failed to connect to RabbitMQ:', err)
      console.log('⏳ Retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  return connection
}

export async function getRabbitChannel(): Promise<Channel> {
  while (!channel) {
    try {
      const conn = await getRabbitConnection()
      channel = await conn.createChannel()
      console.log('✅ RabbitMQ channel created')

      channel.on('error', (err) => {
        console.error('❌ RabbitMQ channel error', err)
        channel = null
      })

      channel.on('close', () => {
        console.warn('⚠️ RabbitMQ channel closed, retrying...')
        channel = null
      })
    } catch (err) {
      console.error('❌ Failed to create RabbitMQ channel:', err)
      console.log('⏳ Retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  return channel
}

/**
 * Initialize top-level topology used across services.
 * Call once at service startup.
 */
export async function initTopology(): Promise<void> {
  const ch = await getRabbitChannel()

  // Payment events exchange
  await ch.assertExchange('payments.events', 'topic', { durable: true })

  // Event exchange for reservation lifecycle events
  await ch.assertExchange('reservations.events', 'topic', { durable: true })

  // Payments queue (consumers pick up messages here)
  await ch.assertQueue('payments.queue', { durable: true })
  await ch.bindQueue('payments.queue', 'payments.events', 'payment.*')

  // Notifications queue (consumers pick up messages here)
  await ch.assertQueue('notifications.queue', { durable: true })
  await ch.bindQueue(
    'notifications.queue',
    'reservations.events',
    'reservation.*'
  )

  // payment’s consumer queue for reservation events
  await ch.assertQueue('reservations.queue.forPayments', { durable: true })
  await ch.bindQueue(
    'reservations.queue.forPayments',
    'reservations.events',
    'reservation.created'
  )

  // Delayed / scheduled notification queue
  await ch.assertExchange('notifications.dlx', 'direct', { durable: true })
  await ch.assertQueue('notifications.delayed', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'reservations.events',
      'x-dead-letter-routing-key': 'reservation.notification',
    },
  })
}
