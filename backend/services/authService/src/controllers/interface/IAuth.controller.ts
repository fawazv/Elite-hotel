import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
interface CustomeRequest extends Request {
  user?: string | JwtPayload;
}

export interface IAuthController {
  signup(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
}
