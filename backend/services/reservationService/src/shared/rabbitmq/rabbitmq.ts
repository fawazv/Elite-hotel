// shared/rabbitmq/rabbitmq.ts
import amqp, { Connection, Channel, Options } from 'amqplib'
import debug from 'debug'

const log = debug('rabbitmq')

export class RabbitMQ {
  private conn?: Connection
  private channel?: Channel
  private url: string

  constructor(url = process.env.RABBIT_URL || 'amqp://localhost:5672') {
    this.url = url
  }

  async connect() {
    if (this.conn) return
    this.conn = await amqp.connect(this.url)
    this.channel = await this.conn.createChannel()
    log('Connected to RabbitMQ')
  }

  async assertExchange(
    name: string,
    type = 'topic',
    opts: Options.AssertExchange = { durable: true }
  ) {
    await this.channel!.assertExchange(name, type, opts)
  }

  async publish(
    exchange: string,
    routingKey: string,
    payload: any,
    opts: Options.Publish = {}
  ) {
    const buffer = Buffer.from(JSON.stringify(payload))
    return this.channel!.publish(exchange, routingKey, buffer, opts)
  }

  async createConsumer(
    queue: string,
    onMessage: (msg: any, raw: amqp.Message) => Promise<void>,
    opts: { prefetch?: number } = {}
  ) {
    await this.channel!.prefetch(
      opts.prefetch || Number(process.env.NOTIFICATION_QUEUE_PREFETCH) || 10
    )
    await this.channel!.assertQueue(queue, { durable: true })
    await this.channel!.consume(
      queue,
      async (raw) => {
        if (!raw) return
        let data = null
        try {
          data = JSON.parse(raw.content.toString())
          await onMessage(data, raw)
          this.channel!.ack(raw)
        } catch (err) {
          log('Consumer error', err)
          // Nack and requeue = false => go to DLX if configured
          this.channel!.nack(raw, false, false)
        }
      },
      { noAck: false }
    )
  }

  async assertQueue(
    queue: string,
    opts: Options.AssertQueue = { durable: true }
  ) {
    await this.channel!.assertQueue(queue, opts)
  }

  async bindQueue(queue: string, exchange: string, routingKey: string) {
    await this.channel!.bindQueue(queue, exchange, routingKey)
  }

  async close() {
    await this.channel?.close()
    await this.conn?.close()
  }
}
