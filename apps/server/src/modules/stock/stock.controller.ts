import type { Request, Response } from "express";
import { stockService } from "./stock.service";
import { success } from "#shared/utils/api-response";
import type {
  CreateProductBody,
  UpdateProductBody,
  ProductIdParams,
  ListProductsQuery,
  ReceiveStockBody,
  IssueStockBody,
  CorrectionStockBody,
  AcknowledgeMovementBody,
  MovementIdParams,
  ListBalancesQuery,
  ListMovementsQuery,
} from "./stock.schema";

export const stockController = {
  async createProduct(
    req: Request<unknown, unknown, CreateProductBody>,
    res: Response,
  ) {
    res
      .status(201)
      .json(
        success({
          product: await stockService.createProduct(req.body, req.user!.userId),
        }),
      );
  },

  async listProducts(req: Request, res: Response) {
    const query = res.locals.query as ListProductsQuery;
    res.json(success({ products: await stockService.listProducts(query) }));
  },

  async getProductById(req: Request, res: Response) {
    const { id } = res.locals.params as ProductIdParams;
    res.json(success({ product: await stockService.getProductById(id) }));
  },

  async updateProduct(
    req: Request<unknown, unknown, UpdateProductBody>,
    res: Response,
  ) {
    const { id } = res.locals.params as ProductIdParams;
    res.json(
      success({ product: await stockService.updateProduct(id, req.body) }),
    );
  },

  async deactivateProduct(req: Request, res: Response) {
    const { id } = res.locals.params as ProductIdParams;
    res.json(
      success({
        product: await stockService.deactivateProduct(id, req.user!.userId),
      }),
    );
  },

  async reactivateProduct(req: Request, res: Response) {
    const { id } = res.locals.params as ProductIdParams;
    res.json(
      success({
        product: await stockService.reactivateProduct(id, req.user!.userId),
      }),
    );
  },

  async listBalances(req: Request, res: Response) {
    const query = res.locals.query as ListBalancesQuery;
    res.json(success({ balances: await stockService.listBalances(query) }));
  },

  async receive(
    req: Request<unknown, unknown, ReceiveStockBody>,
    res: Response,
  ) {
    res
      .status(201)
      .json(
        success({
          movement: await stockService.receive(req.body, req.user!.userId),
        }),
      );
  },

  async issue(req: Request<unknown, unknown, IssueStockBody>, res: Response) {
    res
      .status(201)
      .json(
        success({
          movement: await stockService.issue(req.body, req.user!.userId),
        }),
      );
  },

  async correction(
    req: Request<unknown, unknown, CorrectionStockBody>,
    res: Response,
  ) {
    res
      .status(201)
      .json(
        success({
          movement: await stockService.correction(req.body, req.user!.userId),
        }),
      );
  },

  async acknowledge(
    req: Request<unknown, unknown, AcknowledgeMovementBody>,
    res: Response,
  ) {
    const { id } = res.locals.params as MovementIdParams;
    res.json(
      success({
        movement: await stockService.acknowledge(
          id,
          req.body,
          req.user!.userId,
          req.permission!,
        ),
      }),
    );
  },

  async listMovements(req: Request, res: Response) {
    const query = res.locals.query as ListMovementsQuery;
    res.json(success({ movements: await stockService.listMovements(query) }));
  },
};
