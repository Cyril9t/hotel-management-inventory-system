import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { cookie } from "#shared/lib/cookie";
import { success } from "#shared/utils/api-response";
import type {
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "./auth.schema";

export const authController = {
  async login(req: Request<unknown, unknown, LoginBody>, res: Response) {
    const {
      user,
      tokens: { accessToken, refreshToken, expiresAt },
    } = await authService.login(req.body.email, req.body.password);
    cookie.setRefreshToken(res, refreshToken, expiresAt);
    res.json(success({ user, accessToken }));
  },

  async getSession(req: Request, res: Response) {
    res.json(
      success({
        user: await authService.getSession(req.user!.userId),
      }),
    );
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = cookie.getRefreshToken(req);
    const tokens = await authService.refresh(refreshToken);
    cookie.setRefreshToken(res, tokens.refreshToken, tokens.expiresAt);
    res.json(success({ accessToken: tokens.accessToken }));
  },

  async logout(req: Request, res: Response) {
    const refreshToken = cookie.getRefreshToken(req);
    if (refreshToken) await authService.logout(refreshToken);
    cookie.clearRefreshToken(res);
    res.status(204).send();
  },

  async forgotPassword(
    req: Request<unknown, unknown, ForgotPasswordBody>,
    res: Response,
  ) {
    await authService.forgotPassword(req.body.email);
    res.status(204).send();
  },

  async resetPassword(
    req: Request<unknown, unknown, ResetPasswordBody>,
    res: Response,
  ) {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(204).send();
  },
};
