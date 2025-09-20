import { getRabbitChannel } from '../config/rabbitmq.config'
import { HousekeepingService } from '../services/implementation/housekeeping.service'
import { ConsumeMessage } from 'amqplib'

export async function startHousekeepingConsumer(
  housekeepingService: HousekeepingService
) {
  const ch = await getRabbitChannel()
  const queue = 'housekeeping.from.reservations'

  await ch.assertQueue(queue, { durable: true })

  ch.consume(queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return
    try {
      const evt = JSON.parse(msg.content.toString())
      // expect evt.event === 'reservation.checkedOut'
      if (evt?.event === 'reservation.checkedOut' && evt?.data) {
        const { roomId, reservationId } = evt.data
        // create a pending housekeeping task (unassigned)
        await housekeepingService.assignTask({
          roomId,
          reservationId,
          assignedTo: '',
          notes: 'Auto-created after checkout',
        })
      }
      ch.ack(msg)
    } catch (err) {
      console.error('Housekeeping consumer error', err)
      ch.nack(msg, false, false)
    }
  })
}
