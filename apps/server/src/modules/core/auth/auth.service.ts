import { randomBytes } from "crypto";
import { jwt } from "../../shared/lib/jwt";
import { password } from "../../shared/lib/password";
import { usersRepository } from "../users/users.repository";
import { authRepository } from "./auth.repository";
import {
  UnauthorizedError,
  BadRequestError,
} from "../../shared/errors/http-errors";
// TODO: build this — Resend-based email sender, not yet created.
import { sendPasswordResetEmail } from "../../shared/lib/email";

const RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes

export const authService = {
  async login(email: string, plainPassword: string) {
    const user = await usersRepository.findByEmail(email);

    // Same error for "no user" and "wrong password" — don't leak which.
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await password.compare(plainPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return issueTokens(user.id, user.role, user.department);
  },

  async refresh(refreshToken: string) {
    const payload = jwt.verifyRefreshToken(refreshToken);
    const stored = await authRepository.findRefreshTokenByJti(payload.jti);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Rotate: revoke the used token, issue a fresh pair.
    await authRepository.revokeRefreshToken(payload.jti);

    const user = await usersRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError();
    }

    return issueTokens(user.id, user.role, user.department);
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;

    try {
      const payload = jwt.verifyRefreshToken(refreshToken);
      await authRepository.revokeRefreshToken(payload.jti);
    } catch {
      // Already invalid/expired — nothing to revoke, not an error case.
    }
  },

  async forgotPassword(email: string) {
    const user = await usersRepository.findByEmail(email);

    // Always respond the same way whether or not the email exists.
    if (!user || !user.isActive) return;

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = jwt.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await authRepository.createPasswordResetToken(
      user.id,
      tokenHash,
      expiresAt,
    );
    await sendPasswordResetEmail(user.email, rawToken);
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = jwt.hashToken(rawToken);
    const record = await authRepository.findPasswordResetTokenByHash(tokenHash);

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await password.hash(newPassword);
    await usersRepository.update(record.userId, { passwordHash });
    await authRepository.markPasswordResetTokenUsed(record.id);

    // Force re-login on every device after a password reset.
    await authRepository.revokeAllRefreshTokensForUser(record.userId);
  },
};

async function issueTokens(
  userId: string,
  role: string,
  department: string | null,
) {
  const accessToken = jwt.signAccessToken({ userId, role, department });
  const { token: refreshToken, jti } = jwt.signRefreshToken({ userId });
  const expiresAt = jwt.getRefreshTokenExpiry();

  await authRepository.createRefreshToken(userId, jti, expiresAt);

  return { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
}
