import jwt, { JwtPayload } from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { User } from '../models/user.model'
import { CustomeRequest } from '../interfaces/CustomRequest'
import NodeCache from 'node-cache'
import logger from '../utils/logger.service'

// Cache user data for 10 minutes to avoid DB lookups on every request
const userCache = new NodeCache({ stdTTL: 600, checkperiod: 120 })

const authenticateToken = async (
  req: CustomeRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided' 
      })
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.ACCESS_TOKEN_SECRET
    
    if (!secret) {
      logger.error('ACCESS_TOKEN_SECRET is not configured')
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      })
    }

    // ✅ Use synchronous verify (no callback hell)
    const decoded = jwt.verify(token, secret) as JwtPayload
    
    const userId = decoded.id
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload' 
      })
    }

    // ✅ Check cache first to avoid DB lookup
    let userData = userCache.get<any>(userId)
    
    if (!userData) {
      userData = await User.findById(userId)
        .lean()
        .select('_id email role')
        .exec()
      
      if (!userData) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        })
      }
      
      // Cache the user data
      userCache.set(userId, userData)
      logger.debug('User data cached', { userId })
    }

    req.user = { id: userId, ...decoded }
    next()
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      })
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      })
    }
    
    logger.error('Authentication error', { error })
    next(error) // Pass to global error handler
  }
}

export default authenticateToken
