import { getChannel } from '../config/rabbitmq.config'
import { userService } from '../config/container'
import { ConsumeMessage } from 'amqplib'

export async function initUserRpcConsumer() {
  const ch = getChannel()

  ch.consume('rpc.user.getContact', async (msg: ConsumeMessage | null) => {
    if (!msg) return
    try {
      const { userId } = JSON.parse(msg.content.toString())
      const contact = await userService.getUserContact(userId) // { email, phoneNumber }

      ch.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(contact)),
        { correlationId: msg.properties.correlationId }
      )
      ch.ack(msg)
    } catch (err) {
      console.error('User RPC error:', err)
      ch.ack(msg) // avoid blocking
    }
  })

  console.log('[UserService] RPC consumer started: rpc.user.getContact')
}
