import { HttpStatus } from "../../enums/http.status";
import { OtpRepository } from "../../repository/implementation/otp.repository";
import IUserRepository from "../../repository/interface/IUser.repository";
import CustomError from "../../utils/CustomError";
import { sentOTPEmail } from "../../utils/email.util";
import { hashPassword, randomPassword } from "../../utils/hash.util";
import { generateOtp } from "../../utils/otp.util";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.util";
import { IAuthService } from "../interface/IAuth.service";
import bcrypt from "bcryptjs";

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private otpRepository: OtpRepository;

  constructor(userRepository: IUserRepository, otpRepository: OtpRepository) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
  }

  async signUp(email: string) {
    try {
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser && existingUser.isVerified) {
        throw new CustomError("User alsready exits", HttpStatus.ALREADYEXISTS);
      }
      const otp = generateOtp();
      await sentOTPEmail(email, otp);
      await this.otpRepository.create({ email, otp });
    } catch (error) {
      throw error;
    }
  }

  async verifySignUpOtp(
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role: string,
    otp: string,
    type: string
  ) {
    try {
      const checkUser = await this.userRepository.findByEmail(email);
      if (checkUser && checkUser.isVerified && type !== "forgotPassword") {
        throw new CustomError("User alsready exits", HttpStatus.ALREADYEXISTS);
      }

      const getOtp = await this.otpRepository.findOtpByEmail(email);
      if (!getOtp) {
        throw new CustomError("otp expired or invalid!", HttpStatus.NOTFOUND);
      }

      const findOtp = getOtp.find((x) => x.otp == otp);
      if (findOtp && type === "forgetPassword") {
        return {
          success: true,
          message: "otp verified Successfully!",
          role: checkUser?.role,
        };
      }

      const hashedPassword = await hashPassword(password);
      if (findOtp) {
        const userData: any = {
          fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          role: role as "receptionist" | "housekeeper" | "admin",
          isVerified: true,
        };

        const user = await this.userRepository.create(userData);
        await this.otpRepository.deleteOtp(email);

        const accessToken = generateAccessToken({
          id: user._id.toString(),
          email,
          role: user.role,
        });
        const refreshToken = generateRefreshToken({
          id: user._id.toString(),
          email,
          role: user.role,
        });

        // await sendUserData('userExchange', newUser)

        return {
          success: true,
          message: "OTP verified successfully!",
          data: { user, accessToken, refreshToken },
        };
      } else {
        throw new CustomError("otp expired or invalid!", HttpStatus.NOTFOUND);
      }
    } catch (error) {
      throw error;
    }
  }

  async resendOtpWork(email: string) {
    try {
      const otp = generateOtp();
      await sentOTPEmail(email, otp);
      await this.otpRepository.create({ email, otp });
      return { success: true, message: "Resend otp passed to user" };
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string, role: string) {
    try {
      const checkUser = await this.userRepository.findByEmail(email);
      if (!checkUser || role !== checkUser.role) {
        throw new CustomError("user not found!", HttpStatus.NOTFOUND);
      }

      if (checkUser.isVerified === false) {
        throw new CustomError("User not verifed!", HttpStatus.UNAUTHORIZED);
      }

      const passwordCheck = await bcrypt.compare(password, checkUser.password);
      if (!passwordCheck) {
        throw new CustomError("Invalid credentials!", HttpStatus.UNAUTHORIZED);
      }

      const accessToken = generateAccessToken({
        id: checkUser._id.toString(),
        email,
        role: checkUser.role,
      });

      const refreshToken = generateRefreshToken({
        id: checkUser._id.toString(),
        email,
        role: checkUser.role,
      });

      return {
        success: true,
        message: "Sign in successfully completed!",
        data: { user: checkUser, accessToken, refreshToken },
      };
    } catch (error) {}
  }

  async singInWithGoogle(email: string, name: string, role: string) {
    try {
      let userData = await this.userRepository.findByEmail(email);
      if (userData) {
        const accessToken = generateAccessToken({
          id: userData._id.toString(),
          email,
          role: userData.role,
        });
        const refreshToken = generateRefreshToken({
          id: userData._id.toString(),
          email,
          role: userData.role,
        });

        return {
          success: true,
          message: "Sign in with google completed",
          role: role,
          exist: true,
          data: { user: userData, accessToken, refreshToken },
        };
      }

      const password = randomPassword;

      const hashedPassword = await hashPassword(password);
      userData = await this.userRepository.create({
        email,
        fullName: name,
        password: hashedPassword,
        role: role as "receptionist" | "housekeeper" | "admin",
        isVerified: true,
      });

      const accessToken = generateAccessToken({
        id: userData._id.toString(),
        email,
        role: userData.role,
      });
      const refreshToken = generateRefreshToken({
        id: userData._id.toString(),
        email,
        role: userData.role,
      });

      return {
        success: true,
        message: "Sign in with google completed",
        role: role,
        exist: false,
        data: { user: userData, accessToken, refreshToken },
      };
    } catch (error) {
      throw error;
    }
  }
}
