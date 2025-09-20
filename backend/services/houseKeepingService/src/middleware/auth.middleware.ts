import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError'

export interface AuthRequest extends Request {
  user?: any
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers['authorization']
  if (!auth) return next(new AppError('No token provided', 401))
  const token = (auth as string).split(' ')[1]
  if (!token) return next(new AppError('Malformed token', 401))

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || 'changeme'
    const payload = jwt.verify(token, secret)
    req.user = payload
    next()
  } catch (err) {
    next(new AppError('Invalid token', 401))
  }
}
