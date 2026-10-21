import { database } from "#shared/database/prisma";
import type { User, Prisma, Role } from "@prisma/client";
import type { ListInvitesQuery, ListUsersQuery } from "./users.schema";
import {
  SYSTEM_BOOTSTRAP_ID,
  SYSTEM_BOOTSTRAP_PASSWORD,
} from "#shared/constants/system-user";
import { compact } from "#shared/utils/omit-undefined";

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

  async findActiveOwner(): Promise<User | null> {
    return database.user.findFirst({
      where: { role: "OWNER", isActive: true },
    });
  },

  async list(filters: ListUsersQuery): Promise<PublicUser[]> {
    const where: Prisma.UserWhereInput = {
      id: { not: SYSTEM_BOOTSTRAP_ID },
      ...compact({ role: filters.role, department: filters.department }),
    };

    return database.user.findMany({
      where,
      select: PUBLIC_USER_SELECT,
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    return database.user.update({
      where: { id },
      data: { passwordHash },
      select: PUBLIC_USER_SELECT,
    });
  },

  // staff invites
  async createInvite(data: Prisma.StaffInviteUncheckedCreateInput) {
    return database.staffInvite.create({ data });
  },

  async findInviteByTokenHash(tokenHash: string) {
    return database.staffInvite.findUnique({ where: { tokenHash } });
  },

  async findPendingInviteByRole(role: Role) {
    return database.staffInvite.findFirst({
      where: { role, status: "PENDING" },
    });
  },

  async markInviteAccepted(id: string, userId: string) {
    return database.staffInvite.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date(), userId },
    });
  },

  async createFromInvite(data: Prisma.UserCreateInput) {
    return database.user.create({ data, select: PUBLIC_USER_SELECT });
  },

  async revokeInvite(id: string) {
    return database.staffInvite.update({
      where: { id },
      data: { status: "REVOKED" },
    });
  },

  async findInviteById(id: string) {
    return database.staffInvite.findUnique({ where: { id } });
  },

  async reissueInviteToken(id: string, tokenHash: string) {
    return database.staffInvite.update({
      where: { id },
      data: {
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
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

  async listInvites(filters: ListInvitesQuery) {
    const where: Prisma.StaffInviteWhereInput = {};

    if (filters.role !== undefined) where.role = filters.role;
    if (filters.department !== undefined) where.department = filters.department;
    if (filters.status !== undefined) where.status = filters.status;

    return database.staffInvite.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  },

  async ensureSystemUser() {
    await database.user.upsert({
      where: { id: SYSTEM_BOOTSTRAP_ID },
      update: {},
      create: {
        id: SYSTEM_BOOTSTRAP_ID,
        firstName: "System",
        lastName: "Bootstrap",
        email: "system@internal.local",
        phone: "0000000000",
        passwordHash: SYSTEM_BOOTSTRAP_PASSWORD,
        role: "OWNER",
        isActive: false,
        deactivatedAt: new Date(),
      },
    });
    return SYSTEM_BOOTSTRAP_ID;
  },
};
