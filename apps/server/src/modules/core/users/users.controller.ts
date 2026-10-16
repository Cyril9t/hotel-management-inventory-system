import type { Request, Response } from "express";
import { usersService } from "./users.service";
import { success } from "#shared/utils/api-response";
import type {
  CreateInviteBody,
  AcceptInviteBody,
  InviteTokenParams,
  UserIdParams,
  ListUsersQuery,
  InviteIdParams,
  ListInvitesQuery,
} from "./users.schema";

export const usersController = {
  async list(req: Request, res: Response) {
    const filters = (res.locals.query ?? {}) as ListUsersQuery;
    res.json(
      success({
        users: await usersService.list(filters),
      }),
    );
  },

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as UserIdParams;
    res.json(
      success({
        user: await usersService.getById(id),
      }),
    );
  },

  async deactivate(req: Request, res: Response) {
    const { id } = res.locals.params as UserIdParams;
    res.json(
      success({
        user: await usersService.deactivate(id),
      }),
    );
  },

  async reactivate(req: Request, res: Response) {
    const { id } = res.locals.params as UserIdParams;
    res.json(
      success({
        user: await usersService.reactivate(id),
      }),
    );
  },

  async createInvite(
    req: Request<unknown, unknown, CreateInviteBody>,
    res: Response,
  ) {
    const actor = req.user!;
    res.status(201).json(
      success({
        user: await usersService.createInvite(
          req.body,
          actor.userId,
          actor.role,
        ),
      }),
    );
  },

  async verifyInvite(req: Request, res: Response) {
    const { token } = res.locals.params as InviteTokenParams;
    const invite = await usersService.verifyInvite(token);
    res.json(
      success({
        invite: {
          email: invite.email,
          role: invite.role,
          department: invite.department,
        },
      }),
    );
  },

  async acceptInvite(
    req: Request<unknown, unknown, AcceptInviteBody>,
    res: Response,
  ) {
    const user = await usersService.acceptInvite(
      req.body.token,
      req.body.password,
    );
    res.status(201).json(success({ user }));
  },

  async resendInvite(req: Request, res: Response) {
    const { id } = res.locals.params as InviteIdParams;
    const invite = await usersService.resendInvite(id, req.user!.role);
    res.json(success({ invite }));
  },

  async listInvites(req: Request, res: Response) {
    const filters = res.locals.query as ListInvitesQuery;
    res.json(
      success({
        invites: await usersService.listInvites(filters),
      }),
    );
  },
};
