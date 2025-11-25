import jwt, { JwtPayload } from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { User } from '../models/user.model'
import { CustomeRequest } from '../interfaces/CustomRequest'

const authenticateToken = async (
  req: CustomeRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided' 
      })
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Invalid token format' 
      })
    }

    const secret = process.env.ACCESS_TOKEN_SECRET
    
    if (!secret) {
      // Log error for debugging but don't expose to client
      console.error('CRITICAL: ACCESS_TOKEN_SECRET not configured')
      return res.status(500).json({ 
        success: false,
        message: 'Authentication service unavailable' 
      })
    }

    // Synchronously verify token to prevent race conditions
    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, secret) as JwtPayload
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      })
    }

    // Validate payload structure
    if (!decoded.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload' 
      })
    }

    // Verify user still exists in database
    const userData = await User.findById(decoded.id).select('_id email role')
    
    if (!userData) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    // Attach user data to request
    req.user = decoded
    
    // Only call next() after all validations pass
    next()
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication error:', error)
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    })
  }
}

export default authenticateToken
