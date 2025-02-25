import { NextFunction, Request, response, Response } from "express";
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

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const response = await this.authService.signIn(email, password, role);

      setRefreshTokenCookie(res, response?.refreshToken!, role);
      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
        data: response?.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, phoneNumber, role } = req.body;

      const response = await this.authService.signInWithGoogle(
        email,
        name,
        phoneNumber,
        role
      );

      setRefreshTokenCookie(res, response?.refreshToken!, role);
      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
        exist: response?.exist,
        data: response?.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const response = await this.authService.sendMail(email);
      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
        response: response,
      });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
        const { email, password, confirmPassword } = req.body
        const response = await this.authService.resetPassword(email, password, confirmPassword)
        return successResponse(res, HttpStatus.OK, response?.message!, {
          success: response?.success,
          response: response,
        });
    } catch (error) {
        console.error('Error founded in reset password', error);
    }
}
