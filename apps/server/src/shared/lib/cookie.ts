import type { Request, Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

export const cookie = {
  setRefreshToken(res: Response, token: string, expiresAt: Date): void {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: "strict",
      expires: expiresAt,
      path: "/auth",
    });
  },

  clearRefreshToken(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: "strict",
      path: "/auth",
    });
  },

  getRefreshToken(req: Request): string | undefined {
    return req.cookies?.[REFRESH_COOKIE_NAME];
  },
};
