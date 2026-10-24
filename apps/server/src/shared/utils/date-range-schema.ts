import { z } from "zod";

export const dateRangeShape = {
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
};

export function dateRangeRefinement(data: {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}) {
  return !data.startDate || !data.endDate || data.endDate >= data.startDate;
}
