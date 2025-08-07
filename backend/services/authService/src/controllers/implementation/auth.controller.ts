import { NextFunction, Request, response, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { IAuthController } from '../interface/IAuth.controller'
import { IAuthService } from '../../services/interface/IAuth.service'
import { HttpStatus } from '../../enums/http.status'
import { successResponse } from '../../utils/response.handler'
import { setRefreshTokenCookie } from '../../utils/tokencookie.util'
import { generateAccessToken } from '../../utils/token.util'
import CustomError from '../../utils/CustomError'

interface CustomeRequest extends Request {
  user?: string | JwtPayload
}

export class AuthController implements IAuthController {
  private authService: IAuthService

  constructor(authService: IAuthService) {
    this.authService = authService
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, phoneNumber, password, role } = req.body
      const response = await this.authService.signUp(
        fullName,
        email,
        phoneNumber,
        password,
        role
      )

      return successResponse(
        res,
        HttpStatus.OK,
        'Sent to otp verification',
        response
      )
    } catch (error) {
      next(error)
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, type } = req.body

      const response = await this.authService.verifySignUpOtp(email, otp, type)
      console.log(response, 'response in otp verification controller ')

      setRefreshTokenCookie(res, response?.refreshToken!, response?.data?.role!)

      return successResponse(res, HttpStatus.OK, response?.message!, {
        data: response?.data,
      })
    } catch (error) {
      next(error)
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const response = await this.authService.resendOtpWork(email)

      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
      })
    } catch (error) {
      next(error)
    }
  }

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body
      const response = await this.authService.signIn(email, password, role)
      console.log(response?.data?.refreshToken)

      setRefreshTokenCookie(res, response?.data?.refreshToken!, role)
      return successResponse(res, HttpStatus.OK, response?.message!, {
        data: response?.data,
      })
    } catch (error) {
      next(error)
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, phoneNumber, role } = req.body

      const response = await this.authService.signInWithGoogle(
        email,
        name,
        phoneNumber,
        role
      )

      setRefreshTokenCookie(res, response?.refreshToken!, role)
      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
        exist: response?.exist,
        data: response?.data,
      })
    } catch (error) {
      next(error)
    }
  }

  async forgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const response = await this.authService.sendMail(email)
      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
        response: response,
      })
    } catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, confirmPassword } = req.body
      const response = await this.authService.resetPassword(
        email,
        password,
        confirmPassword
      )
      return successResponse(res, HttpStatus.OK, response?.message!, {
        success: response?.success,
      })
    } catch (error) {
      next(error)
    }
  }

  async setNewAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
        throw new CustomError('No refresh token provided', HttpStatus.FORBIDDEN)
      }
      const secret = process.env.REFRESH_TOKEN_SECRET
      if (!secret) {
        throw new CustomError(
          'internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
      const decoded = jwt.verify(refreshToken, secret)

      if (
        typeof decoded === 'object' &&
        decoded !== null &&
        'id' in decoded &&
        'email' in decoded &&
        'role' in decoded
      ) {
        // const newAccessToken = jwt.sign({ id: (decoded as JwtPayload).id, role: (decoded as JwtPayload).role }, process.env.ACCESS_TOKEN_SECRET!, {
        //     expiresIn: '15m',
        // });
        const newAccessToken = generateAccessToken({
          id: (decoded as JwtPayload).id,
          email: (decoded as JwtPayload).email,
          role: (decoded as JwtPayload).role,
        })
        return successResponse(res, HttpStatus.OK, 'New access token setted', {
          accessToken: newAccessToken,
        })
      } else {
        res.clearCookie('refreshToken')
        throw new CustomError('Invalid token payload', HttpStatus.FORBIDDEN)
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.clearCookie('refreshToken')
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: 'Refresh token expired, please log in again' })
      }
      next(error)
    }
  }

  async changePassword(req: CustomeRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user as JwtPayload
      if (!user) {
        throw new CustomError('user does not exist', HttpStatus.UNAUTHORIZED)
      }
      const data = req.body

      const passwordUpdate = await this.authService.passwordUpdate(
        user.id,
        data
      )
      if (passwordUpdate?.success) {
        res
          .status(HttpStatus.OK)
          .json({ success: true, message: passwordUpdate?.message })
      } else {
        res
          .status(HttpStatus.OK)
          .json({ success: false, message: passwordUpdate?.message })
      }
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken')
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }
}
