import { HttpStatus } from '../../enums/http.status'
import { OtpRepository } from '../../repository/implementation/otp.repository'
import IUserRepository from '../../repository/interface/IUser.repository'
import CustomError from '../../utils/CustomError'
import { sentOTPEmail } from '../../utils/email.util'
import { hashPassword, generateRandomPassword } from '../../utils/hash.util'
import { generateOtp } from '../../utils/otp.util'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/token.util'
import { IAuthService } from '../interface/IAuth.service'
import bcrypt from 'bcryptjs'
import { Setting } from '../../models/setting.model'
import jwt from 'jsonwebtoken'
import { getChannel } from '../../config/rabbitmq'
import { AuthEventType, AuthRegisteredEvent } from '../../events/auth.events'

interface PasswordUpdate {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export class AuthService implements IAuthService {
  private userRepository: IUserRepository
  private otpRepository: OtpRepository

  constructor(
    userRepository: IUserRepository,
    otpRepository: OtpRepository
  ) {
    this.userRepository = userRepository
    this.otpRepository = otpRepository
  }

  async signUp(
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role: string,
    avatar?: { publicId: string; url: string }
  ) {
    try {
      const hashedPassword = await hashPassword(password)
      const userData: any = {
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: role as 'receptionist' | 'housekeeper' | 'admin',
        isVerified: false,
        avatar,
      }

      let user: any

      try {
        // Atomic Create
        user = await this.userRepository.create(userData)
      } catch (err: any) {
        if (err.code === 11000) {
          // Duplicate key error - check if verified
          const existing = await this.userRepository.findByEmail(email) || await this.userRepository.findByPhoneNumber(phoneNumber)

          if (existing && existing.isVerified) {
            throw new CustomError('User already exists', HttpStatus.ALREADYEXISTS)
          } else if (existing) {
            // Resend flow for unverified user
            // Update latest details
            user = await this.userRepository.updateByEmail(existing.email, {
              ...userData,
              isVerified: false
            })
            // Proceed to send OTP
          }
        } else {
          throw err
        }
      }

      // Publish Event for User Service
      // This is now "Fire and Forget" from the perspective of the HTTP response time,
      // but ensures eventual consistency.
      try {
        const channel = getChannel()
        if (channel) {
          const event: AuthRegisteredEvent = {
            eventType: AuthEventType.AUTH_REGISTERED,
            authId: user._id.toString(),
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            role: user.role,
            isVerified: user.isVerified,
            timestamp: new Date()
          }
          channel.publish('user.events', 'auth.registered', Buffer.from(JSON.stringify(event)))
        }
      } catch (mqErr) {
        console.error('Failed to publish AUTH_REGISTERED event', mqErr)
        // We do not rollback user creation here, as they can "Resend OTP" to retry
      }

      // Rate limiting check
      const latestOtp = await this.otpRepository.findLatestByEmail(email)
      if (latestOtp && latestOtp.createdAt && (Date.now() - new Date(latestOtp.createdAt).getTime() < 60000)) {
        throw new CustomError('Please wait 1 minute before requesting a new OTP', HttpStatus.TOO_MANY_REQUESTS)
      }

      const otp = generateOtp()
      await sentOTPEmail(email, otp)

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      await this.otpRepository.create({ email, otp, expiresAt })
    } catch (error) {
      throw error
    }
  }

  async verifySignUpOtp(email: string, otp: string, type: string) {
    try {
      const checkUser = await this.userRepository.findByEmail(email)

      if (!checkUser) {
        throw new CustomError('user not found!', HttpStatus.NOTFOUND)
      }

      if (checkUser && checkUser.isVerified && type !== 'forgetPassword') {
        throw new CustomError('User already exists', HttpStatus.ALREADYEXISTS)
      }

      const getOtp = await this.otpRepository.findOtpByEmail(email)
      if (!getOtp) {
        throw new CustomError('otp expired or invalid!', HttpStatus.NOTFOUND)
      }

      const findOtp = getOtp.find((x) => x.otp == otp)
      if (findOtp && type === 'forgetPassword') {
        // Generate a temporary reset token
        const resetToken = jwt.sign(
          { email, type: 'reset-password' },
          process.env.ACCESS_TOKEN_SECRET || 'fallback_secret', // Should ideally use a separate secret
          { expiresIn: '5m' }
        )

        return {
          success: true,
          message: 'otp verified Successfully!',
          role: checkUser?.role,
          resetToken: resetToken,
        }
      }

      // Update in UserService as verified - via Event now
      // await this.userServiceClient.updateUser(checkUser._id.toString(), { isVerified: true })

      try {
        const channel = getChannel()
        if (channel) {
          channel.publish('user.events', 'auth.verified', Buffer.from(JSON.stringify({
            eventType: AuthEventType.AUTH_VERIFIED,
            authId: checkUser._id.toString(),
            email: checkUser.email,
            isVerified: true,
            timestamp: new Date()
          })))
        }
      } catch (mqErr) {
        console.error('Failed to publish AUTH_VERIFIED event', mqErr)
      }

      await this.userRepository.updateUserField(email, 'isVerified', true)
      await this.otpRepository.deleteOtp(email)

      const accessToken = generateAccessToken({
        id: checkUser._id.toString(),
        email,
        role: checkUser.role,
      })
      const refreshToken = generateRefreshToken({
        id: checkUser._id.toString(),
        email,
        role: checkUser.role,
      })

      return {
        success: true,
        message: 'OTP verified successfully!',
        data: { user: checkUser, accessToken, refreshToken },
      }
    } catch (error) {
      throw error
    }
  }

  async resendOtpWork(email: string) {
    try {
      const latestOtp = await this.otpRepository.findLatestByEmail(email)
      if (latestOtp && latestOtp.createdAt && (Date.now() - new Date(latestOtp.createdAt).getTime() < 60000)) {
        throw new CustomError('Please wait 1 minute before requesting a new OTP', HttpStatus.TOO_MANY_REQUESTS)
      }

      const otp = generateOtp()
      await sentOTPEmail(email, otp)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      await this.otpRepository.create({ email, otp, expiresAt })
      return { success: true, message: 'Resend otp passed to user' }
    } catch (error) {
      throw error
    }
  }

  async signIn(email: string, password: string, role: string) {
    try {
      const checkUser = await this.userRepository.findByEmailWithPassword(email)
      if (!checkUser || role !== checkUser.role) {
        throw new CustomError('user not found!', HttpStatus.NOTFOUND)
      }

      if (checkUser.isVerified === false) {
        throw new CustomError('User not verified!', HttpStatus.UNAUTHORIZED)
      }

      const passwordCheck = await bcrypt.compare(password, checkUser.password)
      if (!passwordCheck) {
        throw new CustomError('Invalid credentials!', HttpStatus.UNAUTHORIZED)
      }

      // Check for 2FA if user is admin
      if (role === 'admin') {
        const setting = await Setting.findOne({ key: 'security.2fa' });
        if (setting && setting.value === true) {
          const otp = generateOtp()
          await sentOTPEmail(email, otp)

          const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          await this.otpRepository.create({ email, otp, expiresAt })

          return {
            success: true,
            message: '2FA verification required',
            require2fa: true,
            data: { email }
          }
        }
      }

      const accessToken = generateAccessToken({
        id: checkUser._id.toString(),
        email,
        role: checkUser.role,
      })

      const refreshToken = generateRefreshToken({
        id: checkUser._id.toString(),
        email,
        role: checkUser.role,
      })

      return {
        success: true,
        message: 'Signed in successfully',
        data: { user: checkUser, accessToken, refreshToken },
      }
    } catch (error) {
      throw error
    }
  }

  async signInWithGoogle(
    email: string,
    name: string,
    phoneNumber: string,
    role: string
  ) {
    try {
      let userData = await this.userRepository.findByEmail(email)
      if (userData) {

        const accessToken = generateAccessToken({
          id: userData._id.toString(),
          email,
          role: userData.role,
        })
        const refreshToken = generateRefreshToken({
          id: userData._id.toString(),
          email,
          role: userData.role,
        })

        return {
          success: true,
          message: 'Sign in with google completed',
          role: role,
          exist: true,
          data: { user: userData, accessToken, refreshToken },
        }
      }

      const password = generateRandomPassword()
      const hashedPassword = await hashPassword(password)

      const newUserData = {
        email,
        fullName: name,
        phoneNumber,
        password: hashedPassword,
        role: role as 'receptionist' | 'housekeeper',
        isVerified: true,
      }

      // Create in local cache first (Atomic)
      userData = await this.userRepository.create({
        ...newUserData,
        // _id will be auto-generated
      })

      // Async: Publish event
      try {
        const channel = getChannel()
        if (channel) {
          const event: AuthRegisteredEvent = {
            eventType: AuthEventType.AUTH_REGISTERED,
            authId: userData._id.toString(),
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            fullName: userData.fullName,
            role: userData.role,
            isVerified: userData.isVerified,
            timestamp: new Date()
          }
          channel.publish('user.events', 'auth.registered', Buffer.from(JSON.stringify(event)))
        }
      } catch (e) {
        console.error('Failed to publish google auth event', e)
      }

      // Legacy support if needed, or remove? Keeping for now if other consumers listen to 'userExchange'
      // await sendUserData('userExchange', userData) 

      const accessToken = generateAccessToken({
        id: userData._id.toString(),
        email,
        role: userData.role,
      })
      const refreshToken = generateRefreshToken({
        id: userData._id.toString(),
        email,
        role: userData.role,
      })

      return {
        success: true,
        message: 'Sign in with google completed',
        role: role,
        exist: false,
        data: { user: userData, accessToken, refreshToken },
      }
    } catch (error) {
      throw error
    }
  }

  async sendMail(email: string) {
    try {
      const isUser = await this.userRepository.findByEmail(email)
      if (!isUser || isUser.isVerified === false) {
        throw new CustomError('user not found!', HttpStatus.NOTFOUND)
      }
      const otp = generateOtp()

      await sentOTPEmail(email, otp)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      await this.otpRepository.create({ email, otp, expiresAt })
      return { success: true, message: 'OTP send to user email' }
    } catch (error) {
      throw error
    }
  }
  async resetPassword(
    email: string,
    password: string,
    confirmPassword: string,
    token: string
  ) {
    try {
      if (!token) {
        throw new CustomError('Reset token required', HttpStatus.UNAUTHORIZED)
      }

      // Verify token
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'fallback_secret') as any
        if (decoded.email !== email || decoded.type !== 'reset-password') {
          throw new CustomError('Invalid reset token', HttpStatus.FORBIDDEN)
        }
      } catch (err) {
        throw new CustomError('Invalid or expired reset token', HttpStatus.FORBIDDEN)
      }

      if (password !== confirmPassword) {
        throw new CustomError('Passwords do not match', HttpStatus.BAD_REQUEST)
      }
      const hashedPassword = await hashPassword(password)

      // const changePassword = await this.userRepository.updatePasswordUser(email, hashedPassword)
      const changePassword = await this.userRepository.updateUserField(
        email,
        'password',
        hashedPassword
      )
      return { success: true, message: 'New password updated' }
    } catch (error) {
      throw error
    }
  }

  async passwordUpdate(id: string, data: PasswordUpdate) {
    try {
      const { currentPassword, newPassword, confirmPassword } = data
      const checkUser = await this.userRepository.findById(id)
      if (!checkUser) {
        throw new CustomError('user not found', HttpStatus.NOTFOUND)
      }
      const checkPassword = await bcrypt.compare(
        currentPassword,
        checkUser.password
      )

      if (!checkPassword) {
        throw new CustomError('Wrong password', HttpStatus.UNAUTHORIZED)
      }
      if (newPassword !== confirmPassword) {
        throw new CustomError('Passwords do not match', HttpStatus.BAD_REQUEST)
      }
      const hashedPassword = await hashPassword(newPassword)
      const updatePassword = await this.userRepository.update(id, {
        password: hashedPassword,
      })
      if (!updatePassword) {
        throw new CustomError('Password update failed', HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return { success: true, message: 'updated' }
    } catch (error) {
      throw error
    }
  }

  async verifyLoginOtp(email: string, otp: string) {
    try {
      const otpRecords = await this.otpRepository.findOtpByEmail(email)

      const verified = otpRecords?.find(record => record.otp === otp)

      if (!verified) {
        return {
          success: false,
          message: "Invalid OTP",
        }
      }

      const user = await this.userRepository.findByEmail(email)
      if (!user) {
        throw new CustomError('User not found', HttpStatus.NOTFOUND)
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        id: (user._id as unknown as string),
        email: user.email,
        role: user.role
      })

      const refreshToken = generateRefreshToken({
        id: (user._id as unknown as string),
        email: user.email,
        role: user.role
      })

      return {
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken,
          refreshToken
        },
        refreshToken
      }

    } catch (error) {
      throw error
    }
  }

  async getUsersByRole(role: string, page: number = 1, limit: number = 20) {
    try {
      const users = await this.userRepository.findAllByRole(role, { page, limit })
      return { success: true, data: users }
    } catch (error) {
      throw error
    }
  }
}
