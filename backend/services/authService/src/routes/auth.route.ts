import express from 'express'

import validateRequest from '../middleware/validateRequest'
import { signInSchema, signUpSchema } from '../validators/user.validator,'
import { authController } from '../config/container'
import authenticateToken from '../middleware/auth.middleware'

const authRoute = express.Router()
authRoute.post(
  '/signup',
  validateRequest(signUpSchema),
  authController.signup.bind(authController)
)
authRoute.post('/otp-signup', authController.verifyOtp.bind(authController))
authRoute.post('/otp-resend', authController.resendOtp.bind(authController))
authRoute.post(
  '/signin',
  validateRequest(signInSchema),
  authController.signin.bind(authController)
)
authRoute.post(
  '/google-signin',
  authController.googleLogin.bind(authController)
)
authRoute.post(
  '/forget-password',
  authController.forgetPassword.bind(authController)
)
authRoute.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
)
authRoute.get(
  '/refresh-token',
  authController.setNewAccessToken.bind(authController)
)
authRoute.patch(
  '/change-password',
  authenticateToken,
  authController.changePassword.bind(authController)
)
authRoute.post('/logout', authController.logout.bind(authController))

export default authRoute
