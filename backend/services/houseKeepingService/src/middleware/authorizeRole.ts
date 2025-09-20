import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'
import { AuthRequest } from './auth.middleware'

export function authorizeRole(allowed: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user || !user.role) return next(new AppError('Unauthorized', 401))
    if (!allowed.includes(user.role))
      return next(new AppError('Forbidden', 403))
    next()
  }
}
