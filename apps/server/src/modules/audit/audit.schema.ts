import { z } from "zod";
import { apiSuccessSchema } from "#shared/utils/api-response";
import {
  badRequestErrorSchema,
  unauthorizedErrorSchema,
  forbiddenErrorSchema,
} from "#shared/errors/http-error-schemas";

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

// Audit records schemas

export const auditLogRecordSchema = z.object({
  id: z.uuid(),
  actorUserId: z.uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  beforeValue: z.json().nullable(),
  afterValue: z.json().nullable(),
  createdAt: z.iso.datetime(),
});

export const auditActorSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
});

export const auditLogWithActorSchema = auditLogRecordSchema.extend({
  actor: auditActorSchema,
});

//  Success responses

export const auditLogsListResponseSchema = apiSuccessSchema(
  z.object({
    audits: z.object({
      logs: z.array(auditLogWithActorSchema),
      pagination: z.object({
        page: z.number().int(),
        pageSize: z.number().int(),
        total: z.number().int(),
      }),
    }),
  }),
);

export const auditEntityHistoryResponseSchema = apiSuccessSchema(
  z.object({
    audit: z.array(auditLogRecordSchema),
  }),
);

export const auditActorHistoryResponseSchema = apiSuccessSchema(
  z.object({
    audit: z.array(auditLogRecordSchema),
  }),
);

// Error responses

export const auditBadRequestResponse = badRequestErrorSchema("Bad request");
export const auditUnauthorizedResponse =
  unauthorizedErrorSchema("Unauthorized");
export const auditForbiddenResponse = forbiddenErrorSchema("Forbidden");

export const invalidEntityParamsResponse = badRequestErrorSchema(
  "Invalid entity parameters",
);

export const invalidActorIdResponse = badRequestErrorSchema("Invalid actor ID");
