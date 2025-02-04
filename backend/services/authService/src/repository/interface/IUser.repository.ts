import IUser from "../../interfaces/IUser";
import { IBaseRepository } from "./IBase.repository";

interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

export default IUserRepository;
