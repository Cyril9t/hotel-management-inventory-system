import type { Request, Response } from "express";
import { auditService } from "./audit.service";
import { success } from "#shared/utils/api-response";
import type {
  ListAuditLogsQuery,
  EntityParams,
  ActorParams,
} from "./audit.schema";

export const auditController = {
  async list(req: Request, res: Response) {
    res.json(
      success({
        audits: await auditService.list(res.locals.query as ListAuditLogsQuery),
      }),
    );
  },

  async getByEntity(req: Request, res: Response) {
    const { entityType, entityId } = res.locals.params as EntityParams;
    res.json(
      success({
        audit: await auditService.getHistory(entityType, entityId),
      }),
    );
  },

  async getByActor(req: Request, res: Response) {
    const { actorUserId } = res.locals.params as ActorParams;
    res.json(
      success({
        audit: await auditService.getByActor(actorUserId),
      }),
    );
  },
};
