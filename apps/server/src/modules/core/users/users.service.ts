import { NotFoundError, BadRequestError } from "#shared/errors/http-errors";
import { usersRepository } from "./users.repository";
import { password } from "#shared/lib/password";
import { jwt } from "#shared/lib/jwt";
import type { CreateInviteBody, ListUsersQuery } from "./users.schema";

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

  async createInvite(data: CreateInviteBody) {
    const rawToken = crypto.randomUUID();
    const invite = await usersRepository.createInvite({
      ...data,
      tokenHash: jwt.hashToken(rawToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    // TODO: queue invite email job with rawToken
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
