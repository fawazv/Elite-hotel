import { Response } from "express";

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  role: string
) => {
  let refreshTokenName: string;
  refreshTokenName = `refreshToken_${role}`;
  res.cookie(refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: 'none',
    // path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
