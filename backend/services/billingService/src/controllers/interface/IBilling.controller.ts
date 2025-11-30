// src/controllers/interface/IBilling.controller.ts
import { Request, Response, NextFunction } from 'express'

export interface IBillingController {
  list(req: Request, res: Response, next: NextFunction): Promise<void>
  getById(req: Request, res: Response, next: NextFunction): Promise<void>
  getByReservation(req: Request, res: Response, next: NextFunction): Promise<void>
}
