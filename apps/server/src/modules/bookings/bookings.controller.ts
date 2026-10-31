import type { Request, Response } from "express";
import { bookingsService } from "./bookings.service";
import { success } from "#shared/utils/api-response";
import { paymentsService } from "#modules/payments/payments.service";
import type {
  CreateBookingBody,
  BookingIdParams,
  ListBookingsQuery,
  CreateBookingPaymentBody,
} from "./bookings.schema";

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

  async list(_req: Request, res: Response) {
    const filters = res.locals.query as ListBookingsQuery;
    const bookings = await bookingsService.listBookings(filters);
    res.json(success({ bookings }));
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

  async createPayment(
    req: Request<unknown, unknown, CreateBookingPaymentBody>,
    res: Response,
  ) {
    const { id } = res.locals.params as BookingIdParams;
    res.status(201).json(
      success({
        payment: await paymentsService.recordForBooking(
          id,
          req.body,
          req.user!.userId,
        ),
      }),
    );
  },

  async listPayments(req: Request, res: Response) {
    const { id } = res.locals.params as BookingIdParams;
    res.json(success({ payments: await paymentsService.listForBooking(id) }));
  },

  async getBalance(req: Request, res: Response) {
    const { id } = res.locals.params as BookingIdParams;
    res.json(success({ balance: await paymentsService.getBookingBalance(id) }));
  },
};
