import { getRabbitChannel } from './rabbitmq.config'

export class RabbitPublisher {
  async publish(exchange: string, routingKey: string, payload: any) {
    const ch = await getRabbitChannel()
    ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    })
  }
}
