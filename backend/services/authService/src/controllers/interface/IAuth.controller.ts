import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
interface CustomeRequest extends Request {
  user?: string | JwtPayload;
}

export interface IAuthController {
  signup(req: Request, res: Response): Promise<void>;
}
