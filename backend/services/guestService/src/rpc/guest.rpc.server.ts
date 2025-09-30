// src/rpc/guest.rpc.server.ts  (inside GuestService)
import { ConsumeMessage } from 'amqplib'
import { getRabbitChannel } from '../config/rabbitmq.config'
import { GuestRepository } from '../repository/implementation/guest.repository'

export async function initGuestRpcServer() {
  const ch = await getRabbitChannel()
  // ensure queue exists
  await ch.assertQueue('guest.service.rpc', { durable: true })

  const repo = new GuestRepository()

  ch.consume('guest.service.rpc', async (msg: ConsumeMessage | null) => {
    if (!msg) return
    try {
      const req = JSON.parse(msg.content.toString())
      if (req.action === 'getContact' && req.guestId) {
        const guest = await repo.findById(req.guestId)
        const payload = guest
          ? { email: guest.email, phoneNumber: guest.phoneNumber }
          : null
        ch.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(payload)),
          {
            correlationId: msg.properties.correlationId,
          }
        )
      } else {
        const payload = null
        ch.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(payload)),
          {
            correlationId: msg.properties.correlationId,
          }
        )
      }
    } catch (err) {
      // reply with null on failure
      try {
        ch.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(null)),
          {
            correlationId: msg.properties.correlationId,
          }
        )
      } catch {}
    } finally {
      ch.ack(msg)
    }
  })
}
