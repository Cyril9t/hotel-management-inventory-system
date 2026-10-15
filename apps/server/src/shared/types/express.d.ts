import type { AccessTokenPayload } from "#shared/lib/jwt.ts";
import type { PublicUser } from "../../modules/core/users/users.repository";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
