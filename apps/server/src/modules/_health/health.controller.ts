import type { Request, Response } from "express";
import { success } from "#shared/utils/api-response";

export const healthController = {
  async getStatus(_req: Request, res: Response) {
    res.json(
      success({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }),
    );
  },

  async getRoot(_req: Request, res: Response) {
    res.json(success({ message: "hotel management server running" }));
  },
};
