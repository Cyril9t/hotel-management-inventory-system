import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../errors/http-errors";
import { formatZodErrors } from "../utils/format-zod-errors";

export interface RequestValidationSchema<
  TBody extends z.ZodType = z.ZodType,
  TQuery extends z.ZodType = z.ZodType,
  TParams extends z.ZodType = z.ZodType,
> {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}

type Location = "body" | "query" | "params";

function buildValidationMessage(locations: Location[]): string {
  if (locations.length === 1) {
    return `Invalid ${locations[0]}`;
  }
  if (locations.length === 2) {
    return `Invalid ${locations[0]} and ${locations[1]}`;
  }
  const last = locations[locations.length - 1];
  const rest = locations.slice(0, -1).join(", ");
  return `Invalid ${rest}, and ${last}`;
}

export function validate<
  TBody extends z.ZodType = z.ZodType,
  TQuery extends z.ZodType = z.ZodType,
  TParams extends z.ZodType = z.ZodType,
>(schemas: RequestValidationSchema<TBody, TQuery, TParams>): RequestHandler {
  return async (req, res, next) => {
    const locations: Array<[Location, z.ZodType | undefined, unknown]> = [
      ["body", schemas.body, req.body],
      ["query", schemas.query, req.query],
      ["params", schemas.params, req.params],
    ];

    const details: Partial<
      Record<Location, ReturnType<typeof formatZodErrors>>
    > = {};

    for (const [location, schema, value] of locations) {
      if (!schema) continue;

      const result = await schema.safeParseAsync(value);

      if (!result.success) {
        details[location] = formatZodErrors(result.error);
        continue;
      }

      if (location === "body") {
        req.body = result.data;
      } else {
        // req.query / req.params are read-only getters in Express 5 —
        // store the parsed/coerced value in res.locals instead of reassigning req.*
        res.locals[location] = result.data;
      }
    }

    const failedLocations = Object.keys(details) as Location[];

    if (failedLocations.length > 0) {
      return next(
        new ValidationError(buildValidationMessage(failedLocations), details),
      );
    }

    next();
  };
}
