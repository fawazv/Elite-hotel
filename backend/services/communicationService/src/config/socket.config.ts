import { Server, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { SocketUser } from '../types'
import { publishEvent } from '../config/rabbitmq.config'
import { socketRateLimitMiddleware } from '../middleware/socket-rate-limit'

import { setupRedisAdapter } from './redis-adapter'

const connectedUsers = new Map<string, SocketUser>()

export const initializeSocketIO = async (httpServer: HTTPServer): Promise<Server> => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  })

  // Setup Redis Adapter if configured
  if (process.env.REDIS_URL) {
    try {
      await setupRedisAdapter(io)
    } catch (error) {
      console.warn('⚠️ Failed to connect to Redis, falling back to in-memory adapter')
    }
  }

  // Authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error('Invalid authentication token'))
    }
  })


  io.on('connection', (socket: Socket) => {
    // Apply rate limiting to call events
    socket.use(async ([eventName, ...args], next) => {
      if (eventName.startsWith('call:')) {
        await socketRateLimitMiddleware(socket, eventName, next)
      } else {
        next()
      }
    })

    const user = socket.data.user as JwtPayload
    console.log(`🔌 User connected: ${user.userId} (${user.role})`)

    // Register user
    connectedUsers.set(user.userId, {
      userId: user.userId,
      userType: user.role === 'admin' || user.role === 'staff' ? 'staff' : 'guest',
      socketId: socket.id,
    })

    // Send ICE server configuration
    socket.emit('ice-servers', {
      iceServers: [
        { urls: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302' },
        // Add TURN servers if configured
      ],
    })

    // Handle WebRTC offer
    socket.on('call:offer', async ({ sessionId, receiverId, offer }) => {
      try {
        const receiver = connectedUsers.get(receiverId)
        
        if (!receiver) {
          socket.emit('call:error', { message: 'User is not online' })
          return
        }

        io.to(receiver.socketId).emit('call:incoming', {
          sessionId,
          callerId: user.userId,
          callerType: user.role === 'admin' || user.role === 'staff' ? 'staff' : 'guest',
          offer,
        })

        console.log(`📞 Call offer from ${user.userId} to ${receiverId}`)
      } catch (error) {
        console.error('Error handling call offer:', error)
        socket.emit('call:error', { message: 'Failed to initiate call' })
      }
    })

    // Handle WebRTC answer
    socket.on('call:answer', async ({ sessionId, callerId, answer }) => {
      try {
        const caller = connectedUsers.get(callerId)
        
        if (!caller) {
          socket.emit('call:error', { message: 'Caller is not online' })
          return
        }

        io.to(caller.socketId).emit('call:answered', {
          sessionId,
          answer,
        })

        // Publish event
        await publishEvent('videochat.call.active', {
          sessionId,
          callerId,
          receiverId: user.userId,
          timestamp: new Date(),
        })

        console.log(`✅ Call answered: ${sessionId}`)
      } catch (error) {
        console.error('Error handling call answer:', error)
        socket.emit('call:error', { message: 'Failed to answer call' })
      }
    })

    // Handle ICE candidates
    socket.on('call:ice-candidate', ({ sessionId, targetUserId, candidate }) => {
      try {
        const targetUser = connectedUsers.get(targetUserId)
        
        if (targetUser) {
          io.to(targetUser.socketId).emit('call:ice-candidate', {
            sessionId,
            candidate,
          })
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error)
      }
    })

    // Handle call rejection
    socket.on('call:reject', async ({ sessionId, callerId }) => {
      try {
        const caller = connectedUsers.get(callerId)
        
        if (caller) {
          io.to(caller.socketId).emit('call:rejected', { sessionId })
        }

        // Publish event
        await publishEvent('videochat.call.rejected', {
          sessionId,
          callerId,
          receiverId: user.userId,
          timestamp: new Date(),
        })

        console.log(`❌ Call rejected: ${sessionId}`)
      } catch (error) {
        console.error('Error handling call rejection:', error)
      }
    })

    // Handle call hangup
    socket.on('call:hangup', async ({ sessionId, targetUserId }) => {
      try {
        const targetUser = connectedUsers.get(targetUserId)
        
        if (targetUser) {
          io.to(targetUser.socketId).emit('call:ended', { sessionId })
        }

        // Publish event
        await publishEvent('videochat.call.ended', {
          sessionId,
          userId: user.userId,
          timestamp: new Date(),
        })

        console.log(`📴 Call ended: ${sessionId}`)
      } catch (error) {
        console.error('Error handling call hangup:', error)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(user.userId)
      console.log(`🔌 User disconnected: ${user.userId}`)
    })
  })

  return io
}

export const getConnectedUser = (userId: string): SocketUser | undefined => {
  return connectedUsers.get(userId)
}

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId)
}
