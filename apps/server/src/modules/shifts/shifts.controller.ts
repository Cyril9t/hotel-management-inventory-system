import type { Request, Response } from "express";
import { shiftsService } from "./shifts.service";
import { success } from "#shared/utils/api-response";
import { BadRequestError } from "#shared/errors/http-errors";
import type {
  OpenShiftBody,
  CloseShiftBody,
  ShiftIdParams,
  ListShiftsQuery,
} from "./shifts.schema";

export const shiftsController = {
  async getCurrent(req: Request, res: Response) {
    res.json(
      success({ shift: await shiftsService.getCurrent(req.user!.userId) }),
    );
  },

  async getSuggestedOpeningCash(req: Request, res: Response) {
    res.json(
      success(await shiftsService.getSuggestedOpeningCash(req.user!.userId)),
    );
  },

  async open(req: Request<unknown, unknown, OpenShiftBody>, res: Response) {
    const { userId, department } = req.user!;
    if (!department)
      throw new BadRequestError("User has no department assigned");

    res
      .status(201)
      .json(
        success({
          shift: await shiftsService.open(userId, department, req.body),
        }),
      );
  },

  async close(req: Request<unknown, unknown, CloseShiftBody>, res: Response) {
    const { id } = res.locals.params as ShiftIdParams;
    res.json(
      success({
        shift: await shiftsService.close(
          id,
          req.user!.userId,
          req.permission,
          req.body,
        ),
      }),
    );
  },

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as ShiftIdParams;
    res.json(
      success({ shift: await shiftsService.getById(id, req.permission) }),
    );
  },

  async list(req: Request, res: Response) {
    const query = res.locals.query as ListShiftsQuery;
    res.json(
      success({
        shifts: await shiftsService.list(
          query,
          req.user!.userId,
          req.permission,
        ),
      }),
    );
  },
};
