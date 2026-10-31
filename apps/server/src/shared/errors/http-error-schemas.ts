import { z } from "zod";
import { apiFailureSchema } from "#shared/utils/api-response";

function buildErrorSchema(code: string) {
  return <D extends z.ZodType | undefined = undefined>(
    message: string,
    details?: D,
  ) =>
    apiFailureSchema(
      z.object({
        code: z.literal(code),
        message: z.literal(message),
        ...(details ? { details } : {}),
      }),
    );
}

export const unauthorizedErrorSchema = buildErrorSchema("UNAUTHORIZED");
export const forbiddenErrorSchema = buildErrorSchema("FORBIDDEN");
export const notFoundErrorSchema = buildErrorSchema("NOT_FOUND");
export const badRequestErrorSchema = buildErrorSchema("BAD_REQUEST");
export const validationErrorSchema = buildErrorSchema("VALIDATION_ERROR");
export const corsErrorSchema = buildErrorSchema("CORS_DENIED");
