import jsonwebtoken from "jsonwebtoken";
import { randomUUID, createHash } from "crypto";
import ms from "ms";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

export type AccessTokenPayload = {
  userId: string;
  isActive: boolean;
  role: Role;
  department: string | null | undefined;
};

export type RefreshTokenPayload = {
  userId: string;
  jti: string;
};

export const jwt = {
  signAccessToken(payload: AccessTokenPayload): string {
    return jsonwebtoken.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<
        jsonwebtoken.SignOptions["expiresIn"]
      >,
    });
  },

  signRefreshToken(payload: { userId: string }): {
    token: string;
    jti: string;
  } {
    const jti = randomUUID();
    const token = jsonwebtoken.sign(
      { ...payload, jti },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as NonNullable<
          jsonwebtoken.SignOptions["expiresIn"]
        >,
      },
    );
    return { token, jti };
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jsonwebtoken.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as AccessTokenPayload;
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jsonwebtoken.verify(
      token,
      env.JWT_REFRESH_SECRET,
    ) as RefreshTokenPayload;
  },

  // hashToken(token: string): string {
  //   return createHash("sha256").update(token).digest("hex");
  // },

  getRefreshTokenExpiry(): Date {
    const durationMs = ms(env.JWT_REFRESH_EXPIRES_IN as ms.StringValue);
    return new Date(Date.now() + durationMs);
  },
};
