import { z } from "zod";

export function formatZodErrors(error: z.ZodError) {
  return error.issues.reduce(
    (acc, i) => {
      const path = i.path.join(".");
      const existing = acc.find((e) => e.path === path);
      if (existing) {
        existing.issues.push(i.message);
      } else {
        acc.push({ path, issues: [i.message] });
      }
      return acc;
    },
    [] as { path: string; issues: string[] }[],
  );
}
