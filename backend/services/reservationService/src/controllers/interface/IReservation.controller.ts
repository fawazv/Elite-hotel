// src/controllers/interface/IReservation.controller.ts
import { Request, Response, NextFunction } from 'express'
export interface IReservationController {
  quote(req: Request, res: Response, next: NextFunction): Promise<void>
  create(req: Request, res: Response, next: NextFunction): Promise<void>
  getById(req: Request, res: Response, next: NextFunction): Promise<void>
  getByCode(req: Request, res: Response, next: NextFunction): Promise<void>
  list(req: Request, res: Response, next: NextFunction): Promise<void>
  patch(req: Request, res: Response, next: NextFunction): Promise<void>
  confirm(req: Request, res: Response, next: NextFunction): Promise<void>
  cancel(req: Request, res: Response, next: NextFunction): Promise<void>
  createPublic(req: Request, res: Response, next: NextFunction): Promise<void>
  checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void>
  checkIn(req: Request, res: Response, next: NextFunction): Promise<void>
  checkOut(req: Request, res: Response, next: NextFunction): Promise<void>
}
