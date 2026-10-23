import { subject } from "@casl/ability";
import { database } from "#shared/database/prisma";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "#shared/errors/http-errors";
import { compact } from "#shared/utils/omit-undefined";
import { stockRepository } from "./stock.repository";
import { eventBus } from "#shared/events/bus";
import type { Department, Prisma } from "@prisma/client";
import type { Permissions } from "#shared/lib/permission";
import type {
  CreateProductBody,
  UpdateProductBody,
  ReceiveStockBody,
  IssueStockBody,
  CorrectionStockBody,
  AcknowledgeMovementBody,
  ListProductsQuery,
  ListBalancesQuery,
  ListMovementsQuery,
} from "./stock.schema";

export const stockService = {
  // ---- Products ----
  async createProduct(data: CreateProductBody, createdByUserId: string) {
    return stockRepository.createProduct({
      name: data.name,
      department: data.department,
      unitPrice: data.unitPrice,
      ...(data.lowStockThreshold !== undefined && {
        lowStockThreshold: data.lowStockThreshold,
      }),
      createdBy: { connect: { id: createdByUserId } },
    });
  },

  async getProductById(id: string) {
    const product = await stockRepository.findProductById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  async listProducts(filters: ListProductsQuery) {
    return stockRepository.listProducts(
      compact({ ...filters, isActive: true }),
    );
  },

  async updateProduct(id: string, data: UpdateProductBody) {
    await stockService.getProductById(id);
    return stockRepository.updateProduct(id, compact(data));
  },

  async deactivateProduct(id: string, actorUserId: string) {
    const product = await stockService.getProductById(id);
    const updated = await stockRepository.deactivateProduct(id);

    eventBus.emit("product.deactivated", {
      productId: id,
      actorUserId,
      wasActive: product.isActive,
      department: product.department,
    });
    return updated;
  },

  async reactivateProduct(id: string, actorUserId: string) {
    const product = await stockService.getProductById(id);
    const updated = await stockRepository.reactivateProduct(id);
    eventBus.emit("product.reactivated", {
      productId: id,
      actorUserId,
      wasActive: product.isActive,
      department: product.department,
    });
    return updated;
  },

  // ---- Balances ----
  async listBalances(filters: ListBalancesQuery) {
    return stockRepository.listBalances(compact(filters));
  },

  // ---- Receive: external supplier -> STORE, Store is the single entry point ----
  async receive(data: ReceiveStockBody, actorUserId: string) {
    const product = await stockService.getProductById(data.productId);

    return database.$transaction(async (tx) => {
      await stockRepository.creditBalance(
        tx,
        product.id,
        "STORE",
        data.quantity,
      );
      return stockRepository.createMovement(tx, {
        product: { connect: { id: product.id } },
        movementType: "RECEIVE",
        toDepartment: "STORE",
        quantity: data.quantity,
        actor: { connect: { id: actorUserId } },
      });
    });
  },

  // ---- Issue: works in either direction — Store->Dept (normal issue) or
  // Dept->Store (pull-back) — same method, direction is just the args ----
  async issue(data: IssueStockBody, actorUserId: string) {
    const product = await stockService.getProductById(data.productId);

    return database.$transaction(async (tx) => {
      const debited = await stockRepository.debitBalance(
        tx,
        product.id,
        data.fromDepartment,
        data.quantity,
      );
      if (!debited) {
        throw new BadRequestError(
          `Insufficient stock in ${data.fromDepartment} for this product`,
        );
      }

      // Kitchen requires receipt acknowledgment before stock lands in its balance —
      // every other destination (including a pull-back to STORE) credits immediately.
      if (data.toDepartment !== "KITCHEN") {
        await stockRepository.creditBalance(
          tx,
          product.id,
          data.toDepartment,
          data.quantity,
        );
      }

      return stockRepository.createMovement(tx, {
        product: { connect: { id: product.id } },
        movementType: "ISSUE",
        fromDepartment: data.fromDepartment,
        toDepartment: data.toDepartment,
        quantity: data.quantity,
        actor: { connect: { id: actorUserId } },
      });
    });
  },

  // ---- Correction: manual count adjustment, signed at the API, stored positive ----
  async correction(data: CorrectionStockBody, actorUserId: string) {
    const product = await stockService.getProductById(data.productId);
    const quantity = Math.abs(data.adjustment);

    return database.$transaction(async (tx) => {
      if (data.adjustment > 0) {
        await stockRepository.creditBalance(
          tx,
          product.id,
          data.department,
          quantity,
        );
      } else {
        const debited = await stockRepository.debitBalance(
          tx,
          product.id,
          data.department,
          quantity,
        );
        if (!debited)
          throw new BadRequestError("Correction would take stock below zero");
      }

      return stockRepository.createMovement(tx, {
        product: { connect: { id: product.id } },
        movementType: "CORRECTION",
        toDepartment: data.adjustment > 0 ? data.department : null,
        fromDepartment: data.adjustment < 0 ? data.department : null,
        quantity,
        actor: { connect: { id: actorUserId } },
        correctionReason: data.correctionReason,
      });
    });
  },

  // ---- Acknowledge: Kitchen confirming an ISSUE, crediting only the confirmed amount ----
  async acknowledge(
    movementId: string,
    data: AcknowledgeMovementBody,
    actorUserId: string,
    permission: Permissions,
  ) {
    const movement = await stockRepository.findMovementById(movementId);
    if (!movement) throw new NotFoundError("Stock movement not found");

    if (permission.cannot("update", subject("StockMovement", movement))) {
      throw new ForbiddenError("You cannot acknowledge this movement");
    }
    if (
      movement.movementType !== "ISSUE" ||
      movement.toDepartment !== "KITCHEN"
    ) {
      throw new BadRequestError(
        "Only kitchen-bound issues can be acknowledged",
      );
    }
    if (movement.acknowledgedAt) {
      throw new BadRequestError("This movement has already been acknowledged");
    }
    if (data.acknowledgedQuantity > movement.quantity) {
      throw new BadRequestError(
        "Acknowledged quantity cannot exceed the issued quantity",
      );
    }

    return database.$transaction(async (tx) => {
      if (data.acknowledgedQuantity > 0) {
        await stockRepository.creditBalance(
          tx,
          movement.productId,
          "KITCHEN",
          data.acknowledgedQuantity,
        );
      }

      const updated = await tx.stockMovement.update({
        where: { id: movementId },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedByUserId: actorUserId,
          acknowledgedQuantity: data.acknowledgedQuantity,
        },
      });

      if (data.acknowledgedQuantity !== movement.quantity) {
        eventBus.emit("stock.issueDiscrepancy", {
          movementId,
          actorUserId,
          expectedQuantity: movement.quantity,
          acknowledgedQuantity: data.acknowledgedQuantity,
        });
      }
      eventBus.emit("stock.acknowledged", {
        movementId,
        productId: movement.productId,
        department: "KITCHEN",
        quantity: data.acknowledgedQuantity,
      });

      return updated;
    });
  },

  async listMovements(filters: ListMovementsQuery) {
    return stockRepository.listMovements(compact(filters));
  },

  // ---- Internal only — called by orders.service inside its own transaction.
  // orders never touches stockRepository or stockBalance/stockMovement directly. ----
  async deductForSale(
    tx: Prisma.TransactionClient,
    items: {
      productId: string;
      department: Department;
      quantity: number;
      saleId?: string;
      kitchenOrderId?: string;
    }[],
    actorUserId: string,
  ) {
    for (const item of items) {
      const debited = await stockRepository.debitBalance(
        tx,
        item.productId,
        item.department,
        item.quantity,
      );
      if (!debited)
        throw new BadRequestError(
          `Insufficient stock for product ${item.productId}`,
        );

      await stockRepository.createMovement(tx, {
        product: { connect: { id: item.productId } },
        movementType: "SALE_DEDUCTION",
        fromDepartment: item.department,
        quantity: item.quantity,
        actor: { connect: { id: actorUserId } },
        ...(item.saleId && { sale: { connect: { id: item.saleId } } }),
        ...(item.kitchenOrderId && {
          kitchenOrder: { connect: { id: item.kitchenOrderId } },
        }),
      });
    }
  },

  // ---- Internal only — called by orders.service on an approved void.
  // Reverses the exact department a SALE_DEDUCTION came from, per the confirmed rule. ----
  async reverseForVoid(
    tx: Prisma.TransactionClient,
    items: {
      productId: string;
      department: Department;
      quantity: number;
      saleId?: string;
    }[],
    actorUserId: string,
  ) {
    for (const item of items) {
      await stockRepository.creditBalance(
        tx,
        item.productId,
        item.department,
        item.quantity,
      );
      await stockRepository.createMovement(tx, {
        product: { connect: { id: item.productId } },
        movementType: "CORRECTION",
        toDepartment: item.department,
        quantity: item.quantity,
        actor: { connect: { id: actorUserId } },
        ...(item.saleId && { sale: { connect: { id: item.saleId } } }),
      });
    }
  },
};
