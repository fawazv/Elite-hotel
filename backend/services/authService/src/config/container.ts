import { AuthController } from "../controllers/implementation/auth.controller";
import Otp from "../models/otp.model";
import { User } from "../models/user.model";
import { OtpRepository } from "../repository/implementation/otp.repository";
import { UserRepository } from "../repository/implementation/user.repository";
import { AuthService } from "../services/implementation/auth.service";

// DEPENDENCY INJECTION

// repositories
const userRepository = new UserRepository(User);
const otpRepository = new OtpRepository(Otp);

// Services
const authService = new AuthService(userRepository, otpRepository);
console.log("AuthService initialized:", !!authService);

const authController = new AuthController(authService);

export { authController, authService };
