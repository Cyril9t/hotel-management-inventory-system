import { database } from "../../shared/database/prisma";

export const authRepository = {
  // Refresh tokens
  async createRefreshToken(userId: string, jti: string, expiresAt: Date) {
    return database.refreshToken.create({ data: { userId, jti, expiresAt } });
  },

  async findRefreshTokenByJti(jti: string) {
    return database.refreshToken.findUnique({ where: { jti } });
  },

  async revokeRefreshToken(jti: string) {
    return database.refreshToken.update({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  },

  // Used on password reset, to force re-login everywhere.
  async revokeAllRefreshTokensForUser(userId: string) {
    return database.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  // Password reset tokens
  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return database.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  },

  async findPasswordResetTokenByHash(tokenHash: string) {
    return database.passwordResetToken.findUnique({ where: { tokenHash } });
  },

  async markPasswordResetTokenUsed(id: string) {
    return database.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
