import { database } from "#shared/database/prisma";
import { compact } from "#shared/utils/omit-undefined";
import type { Prisma } from "@prisma/client";

export const auditRepository = {
  async create(data: Prisma.AuditLogCreateInput) {
    return database.auditLog.create({ data });
  },

  async findByEntity(entityType: string, entityId: string) {
    return database.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByActor(actorUserId: string) {
    return database.auditLog.findMany({
      where: { actorUserId },
      orderBy: { createdAt: "desc" },
    });
  },

  async list(filters: {
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    action?: string;
    from?: Date;
    to?: Date;
    skip: number;
    take: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      ...compact({
        entityType: filters.entityType,
        entityId: filters.entityId,
        actorUserId: filters.actorUserId,
        action: filters.action,
      }),
      ...((filters.from !== undefined || filters.to !== undefined) && {
        createdAt: compact({ gte: filters.from, lte: filters.to }),
      }),
    };

    const [logs, total] = await database.$transaction([
      database.auditLog.findMany({
        where,
        include: {
          actor: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      database.auditLog.count({ where }),
    ]);

    return { logs, total };
  },
};
