import IUser from "../../interfaces/IUser";

type UserData = {
  user?: IUser;
  role?: string;
  accessToken?: string;
  refreshToken?: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: UserData;
  refreshToken?: string;
  accessToken?: string;
  exist?: boolean;
  user?: object;
};

export interface IAuthService {
  signUp(email: string): Promise<void>;
  verifySignUpOtp(
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role: string,
    otp: string,
    type: string
  ): Promise<ApiResponse | undefined>;
  resendOtpWork(email: string): Promise<ApiResponse | undefined>;
  signIn(
    email: string,
    password: string,
    role: string
  ): Promise<ApiResponse | undefined>;
  signInWithGoogle(
    email: string,
    name: string,
    phoneNumber: string,
    role: string
  ): Promise<ApiResponse | undefined>;
  sendMail(email: string): Promise<ApiResponse | undefined>;
  resetPassword(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse | undefined>;
}
