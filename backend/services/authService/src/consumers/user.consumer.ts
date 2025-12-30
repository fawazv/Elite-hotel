// src/consumers/user.consumer.ts
import { getChannel } from '../config/rabbitmq'
import { User } from '../models/user.model'

enum UserEventType {
    USER_CREATED = 'user.created',
    USER_UPDATED = 'user.updated',
    USER_DELETED = 'user.deleted',
    USER_APPROVED = 'user.approved',
    USER_VERIFIED = 'user.verified',
    USER_AVATAR_UPDATED = 'user.avatar.updated'
}

export async function initUserEventConsumer() {
  const channel = getChannel()
  const exchange = 'user.events'
  const queue = 'authService.user.events'

  await channel.assertExchange(exchange, 'topic', { durable: true })
  await channel.assertQueue(queue, { durable: true })

  // Bind to all user events
  await channel.bindQueue(queue, exchange, 'user.*')

  channel.consume(queue, async (msg) => {
    if (!msg) return

    try {
      const payload = JSON.parse(msg.content.toString())

      switch (payload.eventType) {
        case UserEventType.USER_CREATED:
        case UserEventType.USER_UPDATED:
        case UserEventType.USER_APPROVED:
        case UserEventType.USER_VERIFIED:
        case UserEventType.USER_AVATAR_UPDATED:
            // Sync user data to local cache
            // Ensure password is not overwritten if not present in payload
            // But payload from userService usually doesn't have password.
            // AuthService manages password hashes locally? NO!
            // Wait. If AuthService creates the user via userService, does userService store the password?
            // userService User model HAS password field.
            // When AuthService calls userService.create(userData), it sends the HASHED password?
            // Yes, standard flow: Auth hashes password, sends to User service.
            // User service stores it.
            // User service publishes event with user data. 
            // DOES EVENT DATA INCLUDE PASSWORD?
            // User service `PATCH` excludes password logic on line 81: `if ((payload as any).password) delete (payload as any).password`
            // User service `create` repo call stores everything.
            // But `User` model in `userService` has `select: false` for password.
            // When we do `created` = `repo.create(data)`, does it return password?
            // Mongoose `create` returns the doc.
            // If we cast it to ANY, it might include password.
            // WE MUST ENSURE PASSWORD IS NOT LEAKED IN EVENTS.
            
            // I need to check `user.service.ts` in `userService` again.
            // If `userService` publishes password, that's a security risk, BUT `authService` NEEDS the password hash to authenticate!
            
            // CRITICAL ARCHITECTURE CHECK:
            // If `userService` is the source of truth, it stores the password hash.
            // `authService` needs to check password on login.
            // Does `authService` fetch from `userService` on every login?
            // OR does `authService` cache the password hash?
            
            // If `authService` caches the password hash, then the event MUST include it (if changed) OR `authService` kept it when it created it.
            // But if user updates password? Password update happens in `authService` usually.
            // `authService` updates password locally AND sends to `userService`?
            // Or `authService` sends to `userService` and `userService` publishes event?
            
            // The plan said: "AuthService makes HTTP/RPC calls to userService for user creation".
            // And "Update authService to listen to user.created events".
            
            // If I rely on `USER_CREATED` event to populate `authService` DB, I need the password hash in that event.
            // BUT strict security says "don't put passwords in events".
            // However, this is an internal backend event.
            
            // BETTER APPROACH:
            // `AuthService.signUp` creates user in `UserService` (sending hash).
            // `AuthService` stores the user locally IMMEDIATELY (with hash).
            // `UserEventConsumer` is for updates from OTHER services (e.g. Admin updates profile).
            // Admin doesn't update password via `userService` generic PATCH usually. Password changes are special.
            // IF admin updates generic fields (name, phone), the event won't have password.
            // So `AuthService` should `findOneAndUpdate` and NOT overwrite password if missing.
            
            // SO:
            // 1. `AuthService.signUp` -> calls `UserService.create` (sends hash). `UserService` stores it.
            // 2. `AuthService` saves to local DB (with hash).
            // 3. `UserService` publishes `USER_CREATED` (WITHOUT hash).
            // 4. `AuthService` consumer receives event. Updates local DB. 
            //    If local DB already has it (from step 2), it just updates fields. Password remains touched.
            
            // This works.
            
            // So I need to ensure `UserService` does NOT publish password.
            
          const updateData = { ...payload.data };
          delete updateData.password; // Ensure password is not overwritten with undefined or leaked

          await User.findOneAndUpdate(
            { _id: payload.data._id },
            { $set: updateData },
            { upsert: true, new: true }
          )
          break

        case UserEventType.USER_DELETED:
          await User.findByIdAndDelete(payload.userId)
          break
      }

      channel.ack(msg)
    } catch (error) {
      console.error('[AuthService] User event processing error:', error)
      // channel.nack(msg, false, true) // Be careful with loops
      channel.ack(msg) // Ack to prevent loop for now
    }
  })

  console.log('[AuthService] User event consumer started')
}
