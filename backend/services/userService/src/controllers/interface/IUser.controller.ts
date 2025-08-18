// src/controllers/interface/IUser.controller.ts
import { Request, Response, NextFunction } from 'express'

export interface IUserController {
  getById(req: Request, res: Response, next: NextFunction): Promise<void>
  list(req: Request, res: Response, next: NextFunction): Promise<void>
  update(req: Request, res: Response, next: NextFunction): Promise<void>
  patch(req: Request, res: Response, next: NextFunction): Promise<void>
  remove(req: Request, res: Response, next: NextFunction): Promise<void>
  updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void>
  removeAvatar(req: Request, res: Response, next: NextFunction): Promise<void>
}
