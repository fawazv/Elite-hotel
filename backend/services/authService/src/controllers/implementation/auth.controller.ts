import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IAuthController } from "../interface/IAuth.controller";
import { IAuthService } from "../../services/interface/IAuth.service";
import { HttpStatus } from "../../enums/http.status";
import { successResponse } from "../../utils/response.handler";
import { setRefreshTokenCookie } from "../../utils/tokencookie.util";

interface CustomeRequest extends Request {
  user?: string | JwtPayload;
}

export class AuthController implements IAuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const response = await this.authService.signUp(email);
      return successResponse(
        res,
        HttpStatus.OK,
        "Sent to otp verification",
        response
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, phoneNumber, password, role, otp, type } =
        req.body;

      const response = await this.authService.verifySignUpOtp(
        fullName,
        email,
        phoneNumber,
        password,
        role,
        otp,
        type
      );
      console.log(response, "response in otp verification controller ");

      setRefreshTokenCookie(res, response?.refreshToken!, role);

      return successResponse(res, HttpStatus.OK, response?.message!, {
        data: response?.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const response = await this.authService.resendOtpWork(email);

      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
      });
    } catch (error) {
      next(error);
    }
  }
}
