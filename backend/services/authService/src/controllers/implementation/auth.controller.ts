import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IAuthController } from "../interface/IAuth.controller";
import { IAuthService } from "../../services/interface/IAuth.service";
import { HttpStatus } from "../../enums/http.status";
import { successResponse } from "../../utils/response.handler";

interface CustomeRequest extends Request {
  user?: string | JwtPayload;
}

export class AuthController implements IAuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async signup(req: Request, res: Response) {
    const { email } = req.body;

    const response = await this.authService.signUp(email);
    return successResponse(
      res,
      HttpStatus.OK,
      "Sent to otp verification",
      response
    );
  }
}
