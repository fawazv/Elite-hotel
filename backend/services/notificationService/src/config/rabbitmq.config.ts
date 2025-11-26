// notification-service/src/config/rabbitmq.config.ts
import amqplib, { Connection, Channel } from 'amqplib'
import logger from '../utils/logger.service'

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let connection: Connection | null = null
let channel: Channel | null = null

export async function getRabbitConnection(): Promise<Connection> {
  while (!connection) {
    try {
      connection = await amqplib.connect(RABBIT_URL)
      logger.info('✅ Connected to RabbitMQ')

      connection.on('error', (err) => {
        logger.error('❌ RabbitMQ connection error', { error: err })
        connection = null
      })

      connection.on('close', () => {
        logger.warn('⚠️ RabbitMQ connection closed, retrying...')
        connection = null
      })
    } catch (err) {
      logger.error('❌ Failed to connect to RabbitMQ', { error: err })
      logger.info('⏳ Retrying in 5 seconds...')
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
      logger.info('✅ RabbitMQ channel created')

      channel.on('error', (err) => {
        logger.error('❌ RabbitMQ channel error', { error: err })
        channel = null
      })

      channel.on('close', () => {
        logger.warn('⚠️ RabbitMQ channel closed, retrying...')
        channel = null
      })
    } catch (err) {
      logger.error('❌ Failed to create RabbitMQ channel', { error: err })
      logger.info('⏳ Retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  return channel
}

export async function initTopology() {
  const channel = await getRabbitChannel()

  // Assert all exchanges (idempotent - creates if not exists, connects if exists)
  await channel.assertExchange('reservations.events', 'topic', { durable: true })
  await channel.assertExchange('payments.events', 'topic', { durable: true })
  await channel.assertExchange('billing.events', 'topic', { durable: true })

  // Delayed queue (with TTL and DLX)
  await channel.assertQueue('notifications.delayed', {
    durable: true,
    deadLetterExchange: 'reservations.events',
    deadLetterRoutingKey: 'reservation.notification',
  })

  // Main notifications queue
  await channel.assertQueue('notifications.queue', { durable: true })

  // Bind to reservation events
  await channel.bindQueue(
    'notifications.queue',
    'reservations.events',
    'reservation.*'
  )

  // Bind to payment events
  await channel.bindQueue(
    'notifications.queue',
    'payments.events',
    'payment.*'
  )

  // Bind to billing events
  await channel.bindQueue(
    'notifications.queue',
    'billing.events',
    'billing.*'
  )

  logger.info('✅ RabbitMQ topology initialized (NotificationService)')
}
