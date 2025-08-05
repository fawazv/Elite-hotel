import e from 'express'
import { HttpStatus } from '../../enums/http.status'
import { sendUserData } from '../../events/rabbitmq/producers/producer'
import { OtpRepository } from '../../repository/implementation/otp.repository'
import IUserRepository from '../../repository/interface/IUser.repository'
import CustomError from '../../utils/CustomError'
import { sentOTPEmail } from '../../utils/email.util'
import { hashPassword, randomPassword } from '../../utils/hash.util'
import { generateOtp } from '../../utils/otp.util'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/token.util'
import { IAuthService } from '../interface/IAuth.service'
import bcrypt from 'bcryptjs'

interface PasswordUpdate {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export class AuthService implements IAuthService {
  private userRepository: IUserRepository
  private otpRepository: OtpRepository

  constructor(userRepository: IUserRepository, otpRepository: OtpRepository) {
    this.userRepository = userRepository
    this.otpRepository = otpRepository
  }

  async signUp(
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role: string
  ) {
    try {
      const existingUser = await this.userRepository.findByEmail(email)

      if (existingUser?.isVerified) {
        throw new CustomError('User already exists', HttpStatus.ALREADYEXISTS)
      }

      if (existingUser && !existingUser.isVerified) {
        // Handle unverified user logic
        throw new CustomError(
          'Please verify your email first',
          HttpStatus.UNAUTHORIZED
        )
      }

      const hashedPassword = await hashPassword(password)
      const userData: any = {
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: role as 'receptionist' | 'housekeeper' | 'admin',
        isVerified: false,
      }

      await this.userRepository.create(userData)

      const otp = generateOtp()
      await sentOTPEmail(email, otp)
      await this.otpRepository.create({ email, otp })
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
        throw new CustomError('User alsready exits', HttpStatus.ALREADYEXISTS)
      }

      const getOtp = await this.otpRepository.findOtpByEmail(email)
      if (!getOtp) {
        throw new CustomError('otp expired or invalid!', HttpStatus.NOTFOUND)
      }

      const findOtp = getOtp.find((x) => x.otp == otp)
      if (findOtp && type === 'forgetPassword') {
        return {
          success: true,
          message: 'otp verified Successfully!',
          role: checkUser?.role,
        }
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
        data: { checkUser, accessToken, refreshToken },
      }
    } catch (error) {
      throw error
    }
  }

  async resendOtpWork(email: string) {
    try {
      const otp = generateOtp()
      await sentOTPEmail(email, otp)
      await this.otpRepository.create({ email, otp })
      return { success: true, message: 'Resend otp passed to user' }
    } catch (error) {
      throw error
    }
  }

  async signIn(email: string, password: string, role: string) {
    try {
      const checkUser = await this.userRepository.findByEmail(email)
      if (!checkUser || role !== checkUser.role) {
        throw new CustomError('user not found!', HttpStatus.NOTFOUND)
      }

      if (checkUser.isVerified === false) {
        throw new CustomError('User not verifed!', HttpStatus.UNAUTHORIZED)
      }

      const passwordCheck = await bcrypt.compare(password, checkUser.password)
      if (!passwordCheck) {
        throw new CustomError('Invalid credentials!', HttpStatus.UNAUTHORIZED)
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
        message: 'Sign in successfully completed!',
        data: { user: checkUser, accessToken, refreshToken },
      }
    } catch (error) {}
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
        await sendUserData('userExchange', userData)

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

      const password = randomPassword

      const hashedPassword = await hashPassword(password)
      userData = await this.userRepository.create({
        email,
        fullName: name,
        phoneNumber,
        password: hashedPassword,
        role: role as 'receptionist' | 'housekeeper',
        isVerified: true,
      })

      await sendUserData('userExchange', userData)

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
      await this.otpRepository.create({ email, otp })
      return { success: true, message: 'OTP send to user email' }
    } catch (error) {
      throw error
    }
  }

  async resetPassword(
    email: string,
    password: string,
    confirmPassword: string
  ) {
    try {
      if (password !== confirmPassword) {
        return { success: false, message: 'Password do not match' }
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
        return { success: false, message: 'wrong password' }
      }
      if (newPassword !== confirmPassword) {
        return { success: false, message: 'password do not match' }
      }
      const hashedPassword = await hashPassword(newPassword)
      const updatePassword = await this.userRepository.update(id, {
        password: hashedPassword,
      })
      if (!updatePassword) {
        return { success: false, message: 'not updated' }
      }
      return { success: true, message: 'updated' }
    } catch (error) {
      throw error
    }
  }
}
