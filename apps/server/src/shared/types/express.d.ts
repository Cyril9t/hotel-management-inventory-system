import type { PublicUser } from "../../modules/core/users/users.repository";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
