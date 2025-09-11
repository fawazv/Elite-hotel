// src/config/rabbitmq.config.ts
import amqplib, { Connection, Channel } from 'amqplib'

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let connection: Connection | null = null
let channel: Channel | null = null

// Track topology to auto-reapply
const exchanges: { name: string; type: string; options?: any }[] = []
const queues: { name: string; options?: any }[] = []
const bindings: { queue: string; exchange: string; pattern: string }[] = []

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

      // 🌀 Re-apply topology every time channel is created
      await applyTopology(channel)
    } catch (err) {
      console.error('❌ Failed to create RabbitMQ channel:', err)
      console.log('⏳ Retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  return channel
}

/**
 * Save and apply exchanges, queues, and bindings
 */
async function applyTopology(ch: Channel) {
  // Declare exchanges
  for (const ex of exchanges) {
    await ch.assertExchange(ex.name, ex.type, ex.options)
  }
  // Declare queues
  for (const q of queues) {
    await ch.assertQueue(q.name, q.options)
  }
  // Apply bindings
  for (const b of bindings) {
    await ch.bindQueue(b.queue, b.exchange, b.pattern)
  }
}

/**
 * Initialize top-level topology used across services.
 * Call once at service startup.
 */
export async function initTopology(): Promise<void> {
  // Register exchanges
  exchanges.push(
    { name: 'reservations.events', type: 'topic', options: { durable: true } },
    { name: 'billing.events', type: 'topic', options: { durable: true } },
    { name: 'notifications.dlx', type: 'direct', options: { durable: true } }
  )

  // Register queues
  queues.push(
    { name: 'notifications.queue', options: { durable: true } },
    {
      name: 'notifications.delayed',
      options: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'reservations.events',
          'x-dead-letter-routing-key': 'reservation.notification',
        },
      },
    }
  )

  // Register bindings
  bindings.push(
    {
      queue: 'notifications.queue',
      exchange: 'reservations.events',
      pattern: 'reservation.*',
    },
    {
      queue: 'notifications.queue',
      exchange: 'billing.events',
      pattern: 'billing.*',
    }
  )

  // Apply immediately to current channel
  const ch = await getRabbitChannel()
  await applyTopology(ch)
}
