// src/consumers/payment.consumer.ts
import { Channel } from 'amqplib'
import { PaymentService } from '../services/implementation/payment.service'
import { getRabbitChannel } from '../config/rabbitmq.config'

export class PaymentConsumer {
  private svc: PaymentService
  private channel: Channel | null = null
  private readonly queue = 'payment_service_queue'

  constructor(svc: PaymentService) {
    this.svc = svc
  }

  async init() {
    this.channel = await getRabbitChannel()
    await this.channel.assertQueue(this.queue, { durable: true })

    // Bind to reservation events
    await this.channel.bindQueue(
      this.queue,
      'reservation_exchange',
      'reservation.cancelled'
    )

    console.log(
      '[PaymentConsumer] Listening for reservation.cancelled events...'
    )

    this.channel.consume(this.queue, async (msg) => {
      if (!msg) return
      try {
        const event = JSON.parse(msg.content.toString())
        switch (event.type) {
          case 'reservation.cancelled':
            await this.handleReservationCancelled(event.data)
            break
          default:
            console.log(`[PaymentConsumer] Ignored event: ${event.type}`)
        }
        this.channel!.ack(msg)
      } catch (err) {
        console.error('PaymentConsumer error:', err)
        this.channel!.nack(msg, false, false) // discard bad msg
      }
    })
  }

  private async handleReservationCancelled(data: {
    reservationId: string
    paymentId: string
  }) {
    console.log(
      `[PaymentConsumer] Reservation cancelled, refunding paymentId=${data.paymentId}`
    )
    await this.svc.initiateRefund(data.paymentId)
  }
}
