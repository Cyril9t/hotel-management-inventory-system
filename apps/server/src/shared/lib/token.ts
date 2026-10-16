import { randomBytes, createHash } from "node:crypto";

export const token = {
  generateToken(): string {
    return randomBytes(32).toString("hex");
  },

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  },
};
