import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import CustomError from '../utils/CustomError';
import { HttpStatus } from '../enums/http.status';

// Define a custom request interface locally since we don't have the global one yet
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
  headers: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      throw new CustomError(
        'Access denied. No token provided',
        HttpStatus.UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new CustomError(
        'Invalid token format. Expected: Bearer <token>',
        HttpStatus.UNAUTHORIZED
      );
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    
    if (!secret) {
      console.error('CRITICAL: ACCESS_TOKEN_SECRET is not defined in environment');
      throw new CustomError(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    if (!decoded.id) {
      throw new CustomError(
        'Invalid token payload',
        HttpStatus.UNAUTHORIZED
      );
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new CustomError('Invalid token', HttpStatus.UNAUTHORIZED));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new CustomError('Token expired', HttpStatus.UNAUTHORIZED));
    }
    next(error);
  }
};

export const socketAuthMiddleware = (socket: any, next: (err?: any) => void) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    return next(new Error('Internal server error: Secret not defined'));
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
};
