import { auditRepository } from "./audit.repository";
import type { Prisma } from "@prisma/client";
import type { ListAuditLogsQuery } from "./audit.schema";
import { compact } from "#shared/utils/omit-undefined";

type AuditLogInput = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeValue?: Prisma.InputJsonValue;
  afterValue?: Prisma.InputJsonValue;
};

export const auditService = {
  async log(input: AuditLogInput) {
    return auditRepository.create({
      actor: { connect: { id: input.actorUserId } },
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      ...compact({
        beforeValue: input.beforeValue,
        afterValue: input.afterValue,
      }),
    });
  },

  async getHistory(entityType: string, entityId: string) {
    return auditRepository.findByEntity(entityType, entityId);
  },

  async getByActor(actorUserId: string) {
    return auditRepository.findByActor(actorUserId);
  },

  async list(filters: ListAuditLogsQuery) {
    const skip = (filters.page - 1) * filters.pageSize;
    const { logs, total } = await auditRepository.list({
      ...compact({
        entityType: filters.entityType,
        entityId: filters.entityId,
        actorUserId: filters.actorUserId,
        action: filters.action,
        from: filters.from,
        to: filters.to,
      }),
      skip,
      take: filters.pageSize,
    });
    return {
      logs,
      pagination: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },
};
