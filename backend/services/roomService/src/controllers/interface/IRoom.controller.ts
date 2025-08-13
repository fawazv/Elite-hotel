import { Request, Response, NextFunction } from 'express'

export interface IRoomController {
  create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  getByNumericId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  patch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  remove(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
  list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void>
}
