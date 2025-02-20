import { HttpStatus } from "../../enums/http.status";
import { OtpRepository } from "../../repository/implementation/otp.repository";
import IUserRepository from "../../repository/interface/IUser.repository";
import CustomError from "../../utils/CustomError";
import { sentOTPEmail } from "../../utils/email.util";
import { hashPassword } from "../../utils/hash.util";
import { generateOtp } from "../../utils/otp.util";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.util";
import { IAuthService } from "../interface/IAuth.service";

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
}
