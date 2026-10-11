import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { cookie } from "../../shared/lib/cookie";
import { UnauthorizedError } from "../../shared/errors/http-errors";

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await authService.login(
      email,
      password
    );

    cookie.setRefreshToken(res, refreshToken, refreshTokenExpiresAt);
    res.status(200).json({ accessToken });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = cookie.getRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    const result = await authService.refresh(refreshToken);

    cookie.setRefreshToken(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.status(200).json({ accessToken: result.accessToken });
  },

  async logout(req: Request, res: Response) {
    const refreshToken = cookie.getRefreshToken(req);
    await authService.logout(refreshToken);

    cookie.clearRefreshToken(res);
    res.status(204).send();
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await authService.forgotPassword(email);

    // Same response regardless of whether the email exists.
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);

    res.status(200).json({ message: "Password reset successfully." });
  },
};
