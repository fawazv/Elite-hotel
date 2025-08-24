// src/controllers/interface/IGuest.controller.ts
import { Request, Response, NextFunction } from 'express'

export interface IGuestController {
  create(req: Request, res: Response, next: NextFunction): Promise<void>
  getById(req: Request, res: Response, next: NextFunction): Promise<void>
  list(req: Request, res: Response, next: NextFunction): Promise<void>
  patch(req: Request, res: Response, next: NextFunction): Promise<void>
  remove(req: Request, res: Response, next: NextFunction): Promise<void>

  updateIdProofImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>
  removeIdProofImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>

  ensureForBooking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>
}
