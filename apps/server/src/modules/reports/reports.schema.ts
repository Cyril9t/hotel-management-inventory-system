import { z } from "zod";
import { Department } from "@prisma/client";

export const reportQuerySchema = z.object({
  reportDate: z.coerce.date(),
  department: z.enum(Department, "Invalid department"),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
