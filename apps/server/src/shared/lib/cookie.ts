import type { Request, Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

export const cookie = {
  setRefreshToken(res: Response, token: string, expiresAt: Date): void {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: "none",
      expires: expiresAt,
      path: REFRESH_COOKIE_PATH,
    });
  },

  clearRefreshToken(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: "none",
      path: REFRESH_COOKIE_PATH,
    });
  },

  getRefreshToken(req: Request): string | undefined {
    return req.cookies?.[REFRESH_COOKIE_NAME];
  },
};
