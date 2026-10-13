import { Role } from "@prisma/client";
import { NotFoundError, BadRequestError, ForbiddenError } from "#shared/errors/http-errors";
import { usersRepository } from "./users.repository";
import { password } from "#shared/lib/password";
import { jwt } from "#shared/lib/jwt";
import { enqueueInviteEmail } from "#shared/jobs/email/email.queue";
import type { CreateInviteBody, ListUsersQuery } from "./users.schema";

// Who each role is allowed to invite
const INVITABLE_ROLES: Record<string, Role[]> = {
  [Role.OWNER]: [Role.GENERAL_MANAGER],
  [Role.GENERAL_MANAGER]: Object.values(Role).filter((r) => r !== Role.OWNER),
};

export const usersService = {
  async list(filters: ListUsersQuery = {}) {
    return usersRepository.list(filters);
  },

  async getById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async deactivate(id: string) {
    return usersRepository.deactivate(id);
  },

  async reactivate(id: string) {
    return usersRepository.reactivate(id);
  },

  async createInvite(data: CreateInviteBody, createdByUserId: string, actorRole: Role) {
    const allowedRoles = INVITABLE_ROLES[actorRole] ?? [];
    if (!allowedRoles.includes(data.role)) {
      throw new ForbiddenError(
        `${actorRole} is not permitted to invite a user with role ${data.role}`,
      );
    }

    const rawToken = crypto.randomUUID();
    const invite = await usersRepository.createInvite({
      ...data,
      tokenHash: jwt.hashToken(rawToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByUserId,
    });
    await enqueueInviteEmail({
      to: invite.email,
      firstName: invite.firstName,
      rawToken,
    });
    return invite;
  },

  async verifyInvite(rawToken: string) {
    const invite = await usersRepository.findInviteByTokenHash(
      jwt.hashToken(rawToken),
    );
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired invite");
    }
    return invite;
  },

  async acceptInvite(rawToken: string, newPassword: string) {
    const invite = await usersService.verifyInvite(rawToken);
    const passwordHash = await password.hash(newPassword);

    const user = await usersRepository.createFromInvite({
      firstName: invite.firstName,
      lastName: invite.lastName,
      email: invite.email,
      phone: invite.phone,
      role: invite.role,
      department: invite.department,
      passwordHash,
    });

    await usersRepository.markInviteAccepted(invite.id);
    return user;
  },
};
