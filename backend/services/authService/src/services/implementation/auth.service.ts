import { HttpStatus } from "../../enums/http.status";
import { OtpRepository } from "../../repository/implementation/otp.repository";
import IUserRepository from "../../repository/interface/IUser.repository";
import CustomError from "../../utils/CustomError";
import { sentOTPEmail } from "../../utils/email.util";
import { generateOtp } from "../../utils/otp.util";
import { IAuthService } from "../interface/IAuth.service";

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private otpRepository: OtpRepository;

  constructor(userRepository: IUserRepository, otpRepository: OtpRepository) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
  }

  async signUp(email: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser && existingUser.isApproved) {
      throw new CustomError("User alsready exits", HttpStatus.ALREADYEXISTS);
    }
    const otp = generateOtp();
    await sentOTPEmail(email, otp);
    await this.otpRepository.create({ email, otp });
  }
}
