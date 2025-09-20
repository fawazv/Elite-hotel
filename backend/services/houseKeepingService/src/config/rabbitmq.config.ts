import amqplib, { Channel, Connection } from 'amqplib'

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let conn: Connection | null = null
let channel: Channel | null = null

export async function getRabbitChannel(): Promise<Channel> {
  while (!channel) {
    try {
      if (!conn) {
        conn = await amqplib.connect(RABBIT_URL)
        console.log('✅ Connected to RabbitMQ')

        conn.on('error', (err) => {
          console.error('❌ RabbitMQ connection error', err)
          conn = null
        })

        conn.on('close', () => {
          console.warn('⚠️ RabbitMQ connection closed, retrying...')
          conn = null
          channel = null
        })
      }

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
      console.error('❌ Failed to connect/create channel:', err)
      console.log('⏳ Retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  return channel
}

export async function initRabbitTopology() {
  let initialized = false

  while (!initialized) {
    try {
      const ch = await getRabbitChannel()

      // exchanges
      await ch.assertExchange('housekeeping.events', 'topic', { durable: true })
      await ch.assertExchange('reservations.events', 'topic', { durable: true })

      // queues
      await ch.assertQueue('housekeeping.events.queue', { durable: true })
      await ch.bindQueue(
        'housekeeping.events.queue',
        'housekeeping.events',
        'housekeeping.*'
      )

      // consumer queue for reservation events (listen reservation.checkedOut)
      await ch.assertQueue('housekeeping.from.reservations', { durable: true })
      await ch.bindQueue(
        'housekeeping.from.reservations',
        'reservations.events',
        'reservation.checkedOut'
      )

      console.log('✅ RabbitMQ topology initialized')
      initialized = true
    } catch (err) {
      console.error('❌ Failed to initialize RabbitMQ topology:', err)
      console.log('⏳ Retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}
