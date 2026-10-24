import type { Request, Response } from "express";
import { ordersService } from "./orders.service";
import { success } from "#shared/utils/api-response";
import type {
  CreateSaleBody,
  SaleIdParams,
  ListSalesQuery,
  RequestVoidBody,
  KitchenOrderIdParams,
  UpdateKitchenOrderStatusBody,
  ListKitchenOrdersQuery,
} from "./orders.schema";

export const ordersController = {
  async create(req: Request<unknown, unknown, CreateSaleBody>, res: Response) {
    res
      .status(201)
      .json(success(await ordersService.create(req.body, req.user!.userId)));
  },

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as SaleIdParams;
    res.json(success({ sale: await ordersService.getById(id) }));
  },

  async list(req: Request, res: Response) {
    const query = res.locals.query as ListSalesQuery;
    res.json(success({ sales: await ordersService.list(query) }));
  },

  async requestVoid(
    req: Request<unknown, unknown, RequestVoidBody>,
    res: Response,
  ) {
    const { id } = res.locals.params as SaleIdParams;
    res.json(
      success({
        sale: await ordersService.requestVoid(
          id,
          req.user!.userId,
          req.permission!,
          req.body.voidReason,
        ),
      }),
    );
  },

  async approveVoid(req: Request, res: Response) {
    const { id } = res.locals.params as SaleIdParams;
    res.json(
      success({
        sale: await ordersService.approveVoid(
          id,
          req.user!.userId,
          req.permission!,
        ),
      }),
    );
  },

  async settle(req: Request, res: Response) {
    const { id } = res.locals.params as SaleIdParams;
    res.json(
      success({
        sale: await ordersService.settle(id, req.user!.userId, req.permission!),
      }),
    );
  },

  async getKitchenOrderById(req: Request, res: Response) {
    const { id } = res.locals.params as KitchenOrderIdParams;
    res.json(
      success({ kitchenOrder: await ordersService.getKitchenOrderById(id) }),
    );
  },

  async listKitchenOrders(req: Request, res: Response) {
    const query = res.locals.query as ListKitchenOrdersQuery;
    res.json(
      success({ kitchenOrders: await ordersService.listKitchenOrders(query) }),
    );
  },

  async updateKitchenOrderStatus(
    req: Request<unknown, unknown, UpdateKitchenOrderStatusBody>,
    res: Response,
  ) {
    const { id } = res.locals.params as KitchenOrderIdParams;
    res.json(
      success({
        kitchenOrder: await ordersService.updateKitchenOrderStatus(
          id,
          req.body,
        ),
      }),
    );
  },
};
