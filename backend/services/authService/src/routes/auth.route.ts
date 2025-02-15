import express from "express";

import { authController } from "../config/container";

const authRoute = express.Router();

authRoute.post("/signup", authController.signup.bind(authController));

export default authRoute;
