import type { AccessTokenPayload } from "#shared/lib/jwt.ts";
import type { Permissions } from "../lib/ability";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      permission?: Permissions;
    }
  }
}

export {};
