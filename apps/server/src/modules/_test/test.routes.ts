import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validator";

const router = Router();

const testSchemas = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  body: z.object({
    email: z.email(),
    age: z.coerce.number().int().min(0).optional(),
  }),
};

router.post("/test/:id", validate(testSchemas), (req, res) => {
  res.json({
    params: req.params, // raw, unvalidated — e.g. id stays a string
    rawQuery: req.query, // raw, unvalidated — page/limit stay strings or missing
    validatedParams: res.locals.params, // coerced: { id: number }
    validatedQuery: res.locals.query, // coerced: { page: number, limit: number } (defaults applied)
    body: req.body, // validated + coerced in place, since body stays writable
  });
});

export default router;
