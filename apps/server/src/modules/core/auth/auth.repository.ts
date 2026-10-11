import { database } from "../../../shared/database/prisma";

export const authRepository = {
  async createRefreshToken(data: {
    userId: string;
    jti: string;
    expiresAt: Date;
  }) {
    return database.refreshToken.create({ data });
  },

  async findRefreshTokenByJti(jti: string) {
    return database.refreshToken.findUnique({ where: { jti } });
  },

  async revokeRefreshToken(id: string) {
    return database.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  async revokeRefreshTokenByJti(jti: string) {
    return database.refreshToken.updateMany({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  },

  async createPasswordResetToken(userId: string, tokenHash: string) {
    return database.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  },

  async findPasswordResetToken(tokenHash: string) {
    return database.passwordResetToken.findUnique({ where: { tokenHash } });
  },

  async markPasswordResetTokenUsed(id: string) {
    return database.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
