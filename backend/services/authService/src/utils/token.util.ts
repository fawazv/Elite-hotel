import jwt from "jsonwebtoken";

interface IUser {
  id: string;
  email: string;
  role: "receptionist" | "housekeeper" | "admin";
}

const generateAccessToken = (user: IUser) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Access token secret is not defined");
  }
  return jwt.sign(user, secret, { expiresIn: "30m" });
};

const generateRefreshToken = (user: IUser) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Refrsesh token secret in not defined");
  }
  return jwt.sign(user, secret, { expiresIn: "7d" });
};

export { generateAccessToken, generateRefreshToken };
