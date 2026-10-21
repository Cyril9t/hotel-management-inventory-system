import { z } from "zod";

export const listAuditLogsQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorUserId: z.uuid("Invalid user id").optional(),
  action: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(25),
});

export const entityParamsSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
});

export const actorParamsSchema = z.object({
  actorUserId: z.uuid("Invalid user id"),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type EntityParams = z.infer<typeof entityParamsSchema>;
export type ActorParams = z.infer<typeof actorParamsSchema>;
