import express from "express";

import { authController } from "../config/container";
import validateRequest from "../middleware/validateRequest";
import { signUpSchema } from "../validators/user.validator,";

const authRoute = express.Router();

authRoute.post("/signup", authController.signup.bind(authController));
authRoute.post("/otp-signup", authController.verifyOtp.bind(authController));

export default authRoute;
