import { Role, Department } from "@prisma/client";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "#shared/errors/http-errors";
import { usersRepository } from "./users.repository";
import { password } from "#shared/lib/password";
import { enqueueInviteEmail } from "#shared/jobs/email/email.queue";
import type {
  CreateInviteBody,
  ListInvitesQuery,
  ListUsersQuery,
} from "./users.schema";
import { token } from "#shared/lib/token";

// Who each role is allowed to invite
const INVITABLE_ROLES: Record<string, Role[]> = {
  [Role.OWNER]: [Role.GENERAL_MANAGER],
  [Role.GENERAL_MANAGER]: Object.values(Role).filter((r) => r !== Role.OWNER),
};

const ROLE_DEPARTMENT_MAP: Record<Role, Department | null> = {
  [Role.OWNER]: null,
  [Role.GENERAL_MANAGER]: null,
  [Role.RECEPTIONIST]: Department.RECEPTION,
  [Role.BAR_STAFF]: Department.BAR,
  [Role.RESTAURANT_STAFF]: Department.RESTAURANT,
  [Role.KITCHEN_STAFF]: Department.KITCHEN,
  [Role.STORE_MANAGER]: Department.STORE,
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

  async createInvite(
    data: CreateInviteBody,
    createdByUserId: string,
    actorRole: Role,
  ) {
    const allowedRoles = INVITABLE_ROLES[actorRole] ?? [];
    if (!allowedRoles.includes(data.role)) {
      throw new ForbiddenError(
        `${actorRole} is not permitted to invite a user with role ${data.role}`,
      );
    }

    const department = ROLE_DEPARTMENT_MAP[data.role];

    // const rawToken = crypto.randomUUID();
    const rawToken = token.generateToken();
    const invite = await usersRepository.createInvite({
      ...data,
      department,
      tokenHash: token.hashToken(rawToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByUserId,
    });
    await enqueueInviteEmail({
      to: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role,
      rawToken,
      expiresAt: invite.expiresAt,
    });
    return invite;
  },

  async resendInvite(id: string, actorRole: Role) {
    const invite = await usersRepository.findInviteById(id);
    if (!invite) throw new NotFoundError("Invite not found");
    if (invite.status !== "PENDING") {
      throw new BadRequestError("Only pending invites can be resent");
    }

    // Same authority check as creating — if you couldn't invite this role, you can't resend it either
    const allowedRoles = INVITABLE_ROLES[actorRole] ?? [];
    if (!allowedRoles.includes(invite.role)) {
      throw new ForbiddenError(
        `${actorRole} is not permitted to resend an invite for role ${invite.role}`,
      );
    }

    // const rawToken = crypto.randomUUID();
    const rawToken = token.generateToken();
    await usersRepository.reissueInviteToken(
      invite.id,
      token.hashToken(rawToken),
    );
    await enqueueInviteEmail({
      to: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role,
      rawToken,
      expiresAt: invite.expiresAt,
    });
    return invite;
  },

  async createOwnerInvite(
    data: Pick<CreateInviteBody, "firstName" | "lastName" | "email" | "phone">,
  ) {
    const existingOwner = await usersRepository.findActiveOwner();
    if (existingOwner) throw new BadRequestError("An owner already exists");

    const pendingInvite = await usersRepository.findPendingInviteByRole(
      Role.OWNER,
    );
    if (pendingInvite) {
      const reissuedToken = token.generateToken();
      await usersRepository.reissueInviteToken(
        pendingInvite.id,
        token.hashToken(reissuedToken),
      );
      await enqueueInviteEmail({
        to: pendingInvite.email,
        firstName: pendingInvite.firstName,
        lastName: pendingInvite.lastName,
        role: pendingInvite.role,
        rawToken: reissuedToken,
        expiresAt: pendingInvite.expiresAt,
      });
      return pendingInvite;
    }

    const systemUserId = await usersRepository.ensureSystemUser();

    // const rawToken = crypto.randomUUID();
    const rawToken = token.generateToken();
    const invite = await usersRepository.createInvite({
      ...data,
      role: Role.OWNER,
      tokenHash: token.hashToken(rawToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByUserId: systemUserId,
    });
    await enqueueInviteEmail({
      to: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role,
      rawToken,
      expiresAt: invite.expiresAt,
    });
    return invite;
  },

  async verifyInvite(rawToken: string) {
    const invite = await usersRepository.findInviteByTokenHash(
      token.hashToken(rawToken),
    );
    if (
      !invite ||
      invite.status !== "PENDING" ||
      invite.expiresAt < new Date()
    ) {
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

    await usersRepository.markInviteAccepted(invite.id, user.id);
    return user;
  },

  async listInvites(filters: ListInvitesQuery = {}) {
    return usersRepository.listInvites(filters);
  },
};
