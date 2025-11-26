import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';

export const initializeSocket = (io: Server) => {
  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.id} (${user.email})`);

    // Join a specific room (e.g., for a booking or support chat)
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${user.id} joined room: ${roomId}`);
      socket.to(roomId).emit('user-connected', user.id);
    });

    // WebRTC Signaling Events
    socket.on('offer', (payload: { roomId: string; offer: any }) => {
      socket.to(payload.roomId).emit('offer', {
        offer: payload.offer,
        senderId: user.id
      });
    });

    socket.on('answer', (payload: { roomId: string; answer: any }) => {
      socket.to(payload.roomId).emit('answer', {
        answer: payload.answer,
        senderId: user.id
      });
    });

    socket.on('ice-candidate', (payload: { roomId: string; candidate: any }) => {
      socket.to(payload.roomId).emit('ice-candidate', {
        candidate: payload.candidate,
        senderId: user.id
      });
    });

    // AI Concierge Chat Event
    socket.on('ai-chat-message', async (message: string) => {
      try {
        const response = await aiService.processMessage(message, user.id);
        socket.emit('ai-chat-response', response);
      } catch (error) {
        console.error('Error processing AI message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id}`);
      // Notify others in rooms this user was part of (optional, complex to track all rooms efficiently without adapter)
    });
  });
};
