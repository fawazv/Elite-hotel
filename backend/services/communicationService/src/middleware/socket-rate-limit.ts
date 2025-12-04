import { Socket } from 'socket.io';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 1, // per 1 second
});

export const socketRateLimitMiddleware = async (
  socket: Socket,
  eventName: string,
  next: Function
) => {
  const userId = socket.data.user?.userId;
  
  if (!userId) {
    return next(new Error('Unauthorized'));
  }

  try {
    await rateLimiter.consume(userId);
    next();
  } catch (error) {
    socket.emit('rate_limit_exceeded', {
      message: 'Too many requests. Please slow down.',
    });
    console.warn(`[Rate Limit] User ${userId} exceeded limit`);
  }
};
