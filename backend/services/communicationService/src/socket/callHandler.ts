import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { getOnlineStaff, getConnectedUser } from '../config/socket.config'

export const registerCallHandlers = (io: Server, socket: Socket) => {
  const socketUser = socket.data.user

  // 1. Initiate Call (Guest -> Staff)
  socket.on('call:initiate', (payload: { guestName: string }) => {
    try {
      console.log(`[Call] Initiate from ${socketUser?.userId} (${payload.guestName})`)
      
      const onlineStaff = getOnlineStaff()
      // Filter for Admin or Receptionist
      const targetStaff = onlineStaff.filter(s => 
        s.role === 'admin' || s.role === 'receptionist'
      )

      if (targetStaff.length === 0) {
        console.warn(`[Call] No staff available for ${socketUser?.userId}`)
        socket.emit('call:error', { message: 'No staff available' })
        return
      }

      const sessionId = uuidv4()
      
      // Notify all available staff
      targetStaff.forEach(staff => {
        const staffSocket = getConnectedUser(staff.userId)
        if (staffSocket) {
             console.log(`[Call] Ringing staff ${staff.userId} (${staff.role})`)
             io.to(staffSocket.socketId).emit('call:incoming', {
                sessionId,
                guestId: socketUser?.userId,
                guestName: payload.guestName,
                role: socketUser?.role
             })
        }
      })

    } catch (error) {
      console.error('[Call] Initiate Error:', error)
      socket.emit('call:error', { message: 'Failed to initiate call' })
    }
  })

  // 2. Accept Call (Staff -> Guest)
  socket.on('call:accept', (payload: { sessionId: string, guestId: string }) => {
    try {
        console.log(`[Call] Accepted by ${socketUser?.userId} for session ${payload.sessionId}`)
        
        const guestSocketUser = getConnectedUser(payload.guestId)
        
        console.log(`[Call] DEBUG: socketUser in accept:`, JSON.stringify(socketUser))
        
        if (!guestSocketUser) {
            console.warn(`[Call] Guest ${payload.guestId} not found`)
            socket.emit('call:error', { message: 'Guest disconnected' })
            return
        }

        const acceptPayload = {
            sessionId: payload.sessionId,
            staffId: socketUser?.userId,
            staffName: socketUser?.name || 'Staff'
        }
        console.log(`[Call] Emitting call:accepted to ${payload.guestId}:`, acceptPayload)

        // Notify Guest
        io.to(guestSocketUser.socketId).emit('call:accepted', acceptPayload)
        
        // Notify other staff that call is taken (optional, but good for UI)
        // We could broadcast to all staff "call:taken" event here
        
    } catch (error) {
        console.error('[Call] Accept Error:', error)
    }
  })

  // 3. Reject Call (Staff -> Guest)
  socket.on('call:reject', (payload: { sessionId: string, guestId: string }) => {
     try {
         const guestSocketUser = getConnectedUser(payload.guestId)
         if (guestSocketUser) {
             io.to(guestSocketUser.socketId).emit('call:rejected', {
                 sessionId: payload.sessionId,
                 reason: 'Staff busy'
             })
         }
     } catch (error) {
         console.error('[Call] Reject Error:', error)
     }
  })

  // 4. Signaling (ICE/Offer/Answer)
  socket.on('call:signal', (payload: { targetId: string, signal: any, type: string }) => {
      try {
          const targetUser = getConnectedUser(payload.targetId)
          if (targetUser) {
              io.to(targetUser.socketId).emit('call:signal', {
                  senderId: socketUser?.userId,
                  signal: payload.signal,
                  type: payload.type
              })
          }
      } catch (error) {
          console.error('[Call] Signal Error:', error)
      }
  })

  // 5. End Call
  socket.on('call:end', (payload: { targetId: string }) => {
      try {
          const targetUser = getConnectedUser(payload.targetId)
          if (targetUser) {
              io.to(targetUser.socketId).emit('call:ended', {
                  endedBy: socketUser?.userId
              })
          }
      } catch (error) {
          console.error('[Call] End Error:', error)
      }
  })
}
