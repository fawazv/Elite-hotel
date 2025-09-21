import amqplib, { Connection, Channel } from 'amqplib'

let connection: Connection | null = null
let channel: Channel | null = null

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

export async function initRabbitMQ(): Promise<Channel> {
  if (channel) return channel

  connection = await amqplib.connect(RABBIT_URL)
  channel = await connection.createChannel()

  // enable direct-reply-to for RPC
  await channel.assertQueue('rpc.user.getContact', { durable: false })

  console.log('[UserService] RabbitMQ connected')
  return channel
}

export function getChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ channel not initialized')
  return channel
}

export async function closeRabbitMQ() {
  await channel?.close()
  await connection?.close()
  connection = null
  channel = null
}
