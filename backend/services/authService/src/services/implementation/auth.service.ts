import { HttpStatus } from '../../enums/http.status'
import { sendUserData } from '../../events/rabbitmq/producers/producer'
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
    role: string,
    avatar?: { publicId: string; url: string }
  ) {
    try {
      const existingEmail = await this.userRepository.findByEmail(email)
      if (existingEmail && existingEmail.isVerified) {
        throw new CustomError('Email already exists', HttpStatus.ALREADYEXISTS)
      }

      const existingPhone = await this.userRepository.findByPhoneNumber(phoneNumber)
      if (existingPhone && existingPhone.isVerified) {
        throw new CustomError('Phone number already exists', HttpStatus.ALREADYEXISTS)
      }

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

      if (!existingEmail && !existingPhone) {
        await this.userRepository.create(userData)
      } else if (existingEmail && !existingEmail.isVerified) {
        await this.userRepository.updateByEmail(email, {
          ...userData,
          isVerified: false,
        })
        await this.otpRepository.deleteOtp(email)
      } else if (existingPhone && !existingPhone.isVerified) {
        // Handle case where phone exists but not verified (maybe update that user record?)
        // For now, assuming email is the primary key for updates in this flow
         await this.userRepository.updateByEmail(existingPhone.email, {
          ...userData,
          isVerified: false,
        })
        await this.otpRepository.deleteOtp(existingPhone.email)
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
        data: { user: checkUser, accessToken, refreshToken },
      }
    } catch (error) {
      throw error
    }
  }

  async resendOtpWork(email: string) {
    try {
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
      const checkUser = await this.userRepository.findByEmail(email)
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

      const password = generateRandomPassword()

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
    confirmPassword: string
  ) {
    try {
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
