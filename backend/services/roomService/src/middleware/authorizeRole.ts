import { Request, Response, NextFunction } from 'express'
import { HttpStatus } from '../enums/http.status'
import CustomError from '../utils/CustomError'

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role
    if (!userRole || !roles.includes(userRole)) {
      throw new CustomError(
        'You do not have permission to perform this action',
        HttpStatus.UNAUTHORIZED
      )
    }
    next()
  }
}
