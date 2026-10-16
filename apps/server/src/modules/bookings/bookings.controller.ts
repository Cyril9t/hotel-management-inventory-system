import type { Request, Response } from "express";
import { bookingsService } from "./bookings.service";
import { success } from "#shared/utils/api-response";
import type { CreateBookingBody, BookingIdParams } from "./bookings.schema";

export const bookingsController = {
  async create(
    req: Request<unknown, unknown, CreateBookingBody>,
    res: Response,
  ) {
    const createdByUserId = req.user!.userId;
    res.status(201).json(
      success({
        booking: await bookingsService.create(req.body, createdByUserId),
      }),
    );
  },

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as BookingIdParams;
    res.json(
      success({
        booking: await bookingsService.getById(id),
      }),
    );
  },

  async checkIn(req: Request, res: Response) {
    const { id } = res.locals.params as BookingIdParams;
    res.json(
      success({
        booking: await bookingsService.checkIn(id),
      }),
    );
  },

  async checkout(req: Request, res: Response) {
    const { id } = res.locals.params as BookingIdParams;
    const settledByUserId = req.user!.userId; // set by authenticate — see flag below
    res.json(
      success({
        booking: await bookingsService.checkout(id, settledByUserId),
      }),
    );
  },
};
