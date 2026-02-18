import { getChannel } from '../config/rabbitmq.config'
import { userService } from '../config/container'
import { AuthEventType, AuthRegisteredEvent, AuthVerifiedEvent } from '../events/auth.events'
import { ConsumeMessage } from 'amqplib'

export async function initAuthEventConsumer() {
    const ch = getChannel()
    const exchange = 'user.events'
    const queueName = 'user.service.auth.events'

    await ch.assertExchange(exchange, 'topic', { durable: true })
    const q = await ch.assertQueue(queueName, { durable: true })

    // Bind to auth events
    await ch.bindQueue(queueName, exchange, 'auth.#')

    ch.consume(queueName, async (msg: ConsumeMessage | null) => {
        if (!msg) return

        try {
            const content = JSON.parse(msg.content.toString())
            const { eventType } = content

            console.log(`[UserService] Received event: ${eventType}`, content.email || content.authId)

            switch (eventType) {
                case AuthEventType.AUTH_REGISTERED:
                    await handleAuthRegistered(content)
                    break
                case AuthEventType.AUTH_VERIFIED:
                    await handleAuthVerified(content)
                    break
                default:
                    console.warn(`[UserService] Unknown event type: ${eventType}`)
            }

            ch.ack(msg)
        } catch (err) {
            console.error('[UserService] Error processing auth event:', err)
            // Decide whether to requeue or DLQ. For now, simple Ack to avoid infinite loops on bad data.
            // Ideally, check if error is transient.
            ch.ack(msg)
        }
    })

    console.log('[UserService] Auth event consumer started')
}

async function handleAuthRegistered(event: AuthRegisteredEvent) {
    try {
        // Check if user exists to ensure idempotency
        const existing = await userService.getById(event.authId)
        if (existing) {
            console.log(`[UserService] User ${event.authId} already exists. Skipping creation.`)
            return
        }

        await userService.create({
            _id: event.authId, // Use Auth ID as User ID
            email: event.email,
            fullName: event.fullName,
            phoneNumber: event.phoneNumber,
            role: event.role,
            isVerified: event.isVerified,
            // Map other fields if necessary
        } as any)

        console.log(`[UserService] User created from auth event: ${event.email}`)
    } catch (err: any) {
        if (err.code === 11000 || err.message?.includes('duplicate key')) {
            console.warn(`[UserService] Duplicate user detected for ${event.email}`)
        } else {
            throw err
        }
    }
}

async function handleAuthVerified(event: AuthVerifiedEvent) {
    try {
        const updated = await userService.patch(event.authId, { isVerified: true })
        if (!updated) {
            console.warn(`[UserService] Failed to update verification status for ${event.authId} - User not found`)
            // Should throw to trigger retry/requeue if we expect the user to arrive later?
            // But since we ack in the main loop, we need to handle it there.
            // For now, warning is sufficient as race conditions might be rare.
        } else {
            console.log(`[UserService] User verified: ${event.authId}`)
        }
    } catch (err) {
        throw err
    }
}
