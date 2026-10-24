import { UnauthorizedError, BadRequestError } from "#shared/errors/http-errors";
import { authRepository } from "./auth.repository";
import { usersRepository } from "../users/users.repository";
import { password } from "#shared/lib/password";
import { enqueuePasswordResetEmail } from "#shared/jobs/email/email.queue";
import { jwt } from "#shared/lib/jwt";
import { eventBus } from "#shared/events/bus";
import type { Role, Department } from "@prisma/client";
import { token } from "#shared/lib/token.js";

export const authService = {
  async login(email: string, plainPassword: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user || !(await password.compare(plainPassword, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    return authService.issueTokenPair(
      user.id,
      user.role,
      user.isActive,
      user.department,
    );
  },

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedError("Invalid refresh token");
    const payload = jwt.verifyRefreshToken(refreshToken);
    const stored = await authRepository.findRefreshTokenByJti(payload.jti);
    if (!stored || stored.revokedAt) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    await authRepository.revokeRefreshToken(stored.id);

    const user = await usersRepository.findById(payload.userId);
    if (!user) throw new UnauthorizedError("Invalid refresh token");

    return authService.issueTokenPair(
      user.id,
      user.role,
      user.isActive,
      user.department,
    );
  },

  async logout(refreshToken: string) {
    const payload = jwt.verifyRefreshToken(refreshToken);
    await authRepository.revokeRefreshTokenByJti(payload.jti);
  },

  async forgotPassword(email: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) return; // don't leak whether the email exists

    const rawToken = token.generateToken();
    const resetToken = await authRepository.createPasswordResetToken(
      user.id,
      token.hashToken(rawToken),
    );
    await enqueuePasswordResetEmail({
      to: user.email,
      rawToken,
      expiresAt: resetToken.expiresAt,
    });
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const resetToken = await authRepository.findPasswordResetToken(
      token.hashToken(rawToken),
    );
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await password.hash(newPassword);
    await usersRepository.updatePassword(resetToken.userId, passwordHash);
    await authRepository.markPasswordResetTokenUsed(resetToken.id);

    eventBus.emit("user.passwordReset", { userId: resetToken.userId });
  },

  async issueTokenPair(
    userId: string,
    role: Role,
    isActive: boolean,
    department?: Department | null,
  ) {
    const accessToken = jwt.signAccessToken({
      userId,
      isActive,
      role,
      department,
    });
    const { token: refreshToken, jti } = jwt.signRefreshToken({ userId });
    const expiresAt = jwt.getRefreshTokenExpiry();
    await authRepository.createRefreshToken({ userId, jti, expiresAt });
    return { accessToken, refreshToken, expiresAt };
  },
};
