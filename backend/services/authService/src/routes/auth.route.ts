import express from 'express'

import validateRequest from '../middleware/validateRequest'
import { signInSchema, signUpSchema } from '../validators/user.validator,'
import {
  otpVerificationSchema,
  otpResendSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  googleSignInSchema,
} from '../validators/auth.validator'
import { authController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'

const authRoute = express.Router()

// Public routes - with validation
authRoute.post(
  '/signup',
  validateRequest(signUpSchema),
  authController.signup.bind(authController)
)

authRoute.post(
  '/otp-signup',
  validateRequest(otpVerificationSchema),
  authController.verifyOtp.bind(authController)
)

authRoute.post(
  '/otp-resend',
  validateRequest(otpResendSchema),
  authController.resendOtp.bind(authController)
)

authRoute.post(
  '/signin',
  validateRequest(signInSchema),
  authController.signin.bind(authController)
)

authRoute.post(
  '/google-signin',
  validateRequest(googleSignInSchema),
  authController.googleLogin.bind(authController)
)

authRoute.post(
  '/forget-password',
  validateRequest(forgetPasswordSchema),
  authController.forgetPassword.bind(authController)
)

authRoute.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword.bind(authController)
)

authRoute.get(
  '/refresh-token',
  authController.setNewAccessToken.bind(authController)
)

// Protected routes - require authentication
authRoute.patch(
  '/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  authController.changePassword.bind(authController)
)

authRoute.post('/logout', authController.logout.bind(authController))

export default authRoute
