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
    const token = req.headers['authorization']
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Access denied. No token provided' })
    }

    const newToken = token.split(' ')[1]
    if (!newToken) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token format' })
    }

    const secret = process.env.ACCESS_TOKEN_SECRET
    if (!secret) {
      console.error('ACCESS_TOKEN_SECRET is not defined')
      return res
        .status(500)
        .json({ success: false, message: 'Server configuration error' })
    }

    // Verify token synchronously using promisify or await approach
    const decoded = jwt.verify(newToken, secret) as JwtPayload
    req.user = decoded

    const userId = req.user.id
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token payload' })
    }

    const userData = await User.findById(userId)
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' })
    }

    next()
  } catch (error) {
    console.error('Error in authenticate token:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ success: false, message: 'Token expired' })
    }
    return res
      .status(500)
      .json({ success: false, message: 'Authentication failed' })
  }
}

export default authenticateToken
