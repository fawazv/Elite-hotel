import IUser from "../../interfaces/IUser";

type common = {
  success: boolean;
  message: string;
  data?: {
    user?: IUser;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  refreshToken?: string;
  accessToken?: string;
  exist?: boolean;
  user?: object;
};

export interface IAuthService {
  signUp(email: string): Promise<common | undefined>;
}
