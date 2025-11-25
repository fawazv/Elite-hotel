import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/user.model'

// Extend Express Request interface
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

// Simple in-memory cache for user lookups (production: use Redis)
const userCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Authentication middleware - validates JWT tokens
 * Fixes: 
 * - Async error handling bug
 * - Timing-safe token validation
 * - Proper Bearer token parsing
 * - User lookup caching for performance
 * - Comprehensive error responses
 */
const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract Authorization header
    const authHeader = req.headers['authorization']
    
    if (!authHeader) {
      res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided' 
      })
      return
    }

    // 2. Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid token format. Expected "Bearer <token>"' 
      })
      return
    }

    // 3. Extract token
    const token = authHeader.split(' ')[1]
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Access denied. Token is missing' 
      })
      return
    }

    // 4. Verify secret exists
    const secret = process.env.ACCESS_TOKEN_SECRET
    if (!secret) {
      console.error('CRITICAL: ACCESS_TOKEN_SECRET is not defined')
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      })
      return
    }

    // 5. Verify JWT token (async/await instead of callback)
    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, secret) as JwtPayload
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        res.status(401).json({ 
          success: false,
          message: 'Token expired. Please log in again',
          code: 'TOKEN_EXPIRED'
        })
        return
      }
      
      if (error instanceof JsonWebTokenError) {
        res.status(401).json({ 
          success: false,
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        })
        return
      }
      
      throw error // Re-throw unexpected errors
    }

    // 6. Validate token payload
    if (!decoded.id) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid token payload',
        code: 'INVALID_PAYLOAD'
      })
      return
    }

    // 7. Check user cache first (performance optimization)
    const cached = userCache.get(decoded.id)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      req.user = decoded
      next()
      return
    }

    // 8. Fetch user from database
    const userData = await User.findById(decoded.id).select('-password').lean()
    
    if (!userData) {
      res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      })
      return
    }

    // 9. Check if user is verified
    if (!userData.isVerified) {
      res.status(403).json({ 
        success: false,
        message: 'Email not verified. Please verify your email',
        code: 'EMAIL_NOT_VERIFIED'
      })
      return
    }

    // 10. Update cache
    userCache.set(decoded.id, { user: userData, timestamp: now })
    
    // Clean up old cache entries (simple cleanup)
    if (userCache.size > 1000) {
      const entriesToDelete: string[] = []
      userCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_TTL) {
          entriesToDelete.push(key)
        }
      })
      entriesToDelete.forEach(key => userCache.delete(key))
    }

    // 11. Attach user to request
    req.user = decoded
    next()

  } catch (error) {
    console.error('Authentication middleware error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication' 
    })
  }
}

/**
 * Clear user from cache (call after logout or password change)
 */
export const clearUserCache = (userId: string): void => {
  userCache.delete(userId)
}

/**
 * Clear entire cache (call on deployment or critical updates)
 */
export const clearAllCache = (): void => {
  userCache.clear()
}

export default authenticateToken
