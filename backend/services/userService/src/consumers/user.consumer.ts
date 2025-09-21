import { getChannel } from '../config/rabbitmq.config'
import { userService } from '../config/container'
import { ConsumeMessage } from 'amqplib'

export async function initUserRpcConsumer() {
  const ch = getChannel()
  await ch.assertQueue('rpc.user.getContact', { durable: false })

  ch.consume('rpc.user.getContact', async (msg: ConsumeMessage | null) => {
    if (!msg) return
    const { userId } = JSON.parse(msg.content.toString())
    const contact = await userService.getUserContact(userId) // { email, phoneNumber }
    ch.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(contact)),
      { correlationId: msg.properties.correlationId }
    )
    ch.ack(msg)
  })
}
