import IUser from "../../interfaces/IUser";

export interface IAuthService {
  signUp(email: string): Promise<void>;
}
