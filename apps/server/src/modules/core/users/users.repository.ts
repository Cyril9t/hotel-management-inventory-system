import { database } from "#shared/database/prisma";
import type { User, Prisma, Role, Department } from "@prisma/client";

// Excludes passwordHash — safe to attach to req.user or return in responses.
export const PUBLIC_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  department: true,
  isActive: true,
  createdAt: true,
  deactivatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;

export const usersRepository = {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return database.user.create({ data });
  },

  // Includes passwordHash — only for login, where it's needed for comparison.
  async findByEmail(email: string): Promise<User | null> {
    return database.user.findUnique({ where: { email } });
  },

  // Safe for middleware/req.user — no passwordHash.
  async findById(id: string): Promise<PublicUser | null> {
    return database.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
  },

  async list(filters: {
    role: Role | undefined;
    department: Department | undefined;
  }): Promise<PublicUser[]> {
    return database.user.findMany({
      where: filters,
      select: PUBLIC_USER_SELECT,
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    return database.user.update({ where: { id }, data: { passwordHash } });
  },

  // staff invites
  async createInvite(data: Prisma.StaffInviteCreateInput) {
    return database.staffInvite.create({ data });
  },

  async findInviteByTokenHash(tokenHash: string) {
    return database.staffInvite.findUnique({ where: { tokenHash } });
  },

  async markInviteAccepted(id: string) {
    return database.staffInvite.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  },

  async createFromInvite(data: Prisma.UserCreateInput) {
    return database.user.create({ data, select: PUBLIC_USER_SELECT });
  },

  // Soft delete only — isActive/deactivatedAt, never a hard delete.
  async deactivate(id: string): Promise<PublicUser> {
    return database.user.update({
      where: { id },
      data: { isActive: false, deactivatedAt: new Date() },
      select: PUBLIC_USER_SELECT,
    });
  },

  async reactivate(id: string): Promise<PublicUser> {
    return database.user.update({
      where: { id },
      data: { isActive: true, deactivatedAt: null },
      select: PUBLIC_USER_SELECT,
    });
  },
};
