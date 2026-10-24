import { Router } from "express";
import { ordersController } from "./orders.controller";
import { authenticate } from "#shared/middleware/authenticate";
import { authorize } from "#shared/middleware/authorize";
import { validate } from "#shared/middleware/validator";
import {
  createSaleSchema,
  saleIdParamsSchema,
  listSalesQuerySchema,
  requestVoidSchema,
  kitchenOrderIdParamsSchema,
  updateKitchenOrderStatusSchema,
  listKitchenOrdersQuerySchema,
} from "./orders.schema";

export const ordersRoutes = Router();

ordersRoutes.use(authenticate);

// Sales
ordersRoutes.post(
  "/sales",
  authorize("create", "Sale"),
  validate({ body: createSaleSchema }),
  ordersController.create,
);
ordersRoutes.get(
  "/sales",
  authorize("read", "Sale"),
  validate({ query: listSalesQuerySchema }),
  ordersController.list,
);
ordersRoutes.get(
  "/sales/:id",
  authorize("read", "Sale"),
  validate({ params: saleIdParamsSchema }),
  ordersController.getById,
);
ordersRoutes.patch(
  "/sales/:id/request-void",
  authorize("void", "Sale"),
  validate({ params: saleIdParamsSchema, body: requestVoidSchema }),
  ordersController.requestVoid,
);
ordersRoutes.patch(
  "/sales/:id/approve-void",
  authorize("void", "Sale"),
  validate({ params: saleIdParamsSchema }),
  ordersController.approveVoid,
);
ordersRoutes.patch(
  "/sales/:id/settle",
  authorize("update", "Sale"),
  validate({ params: saleIdParamsSchema }),
  ordersController.settle,
);

// Kitchen orders
ordersRoutes.get(
  "/kitchen-orders",
  authorize("read", "KitchenOrder"),
  validate({ query: listKitchenOrdersQuerySchema }),
  ordersController.listKitchenOrders,
);
ordersRoutes.get(
  "/kitchen-orders/:id",
  authorize("read", "KitchenOrder"),
  validate({ params: kitchenOrderIdParamsSchema }),
  ordersController.getKitchenOrderById,
);
ordersRoutes.patch(
  "/kitchen-orders/:id/status",
  authorize("update", "KitchenOrder"),
  validate({
    params: kitchenOrderIdParamsSchema,
    body: updateKitchenOrderStatusSchema,
  }),
  ordersController.updateKitchenOrderStatus,
);
