import type { Request, Response } from "express";
import { reportsService } from "./reports.service";
import { success } from "#shared/utils/api-response";
import type { ReportQuery } from "./reports.schema";

export const reportsController = {
  async getReport(req: Request, res: Response) {
    const { reportDate, department } = res.locals.query as ReportQuery;
    res.json(
      success({
        report: await reportsService.getReport(reportDate, department),
      }),
    );
  },
};
