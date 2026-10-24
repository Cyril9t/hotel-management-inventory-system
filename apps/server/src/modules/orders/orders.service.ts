import { database } from "#shared/database/prisma";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "#shared/errors/http-errors";
import { compact } from "#shared/utils/omit-undefined";
import { ordersRepository } from "./orders.repository";
import { shiftsRepository } from "#modules/shifts/shifts.repository";
import { bookingsRepository } from "#modules/bookings/bookings.repository";
import { stockService } from "#modules/stock/stock.service";
import { eventBus } from "#shared/events/bus";
import type { Department } from "@prisma/client";
import { subject } from "@casl/ability";
import type { Permissions } from "#shared/lib/permission";
import type {
  CreateSaleBody,
  ListSalesQuery,
  UpdateKitchenOrderStatusBody,
  ListKitchenOrdersQuery,
} from "./orders.schema";

const ACTIVE_BOOKING_STATUSES = ["CHECKED_IN", "CHECKOUT_DUE", "OVERDUE"];

export const ordersService = {
  async create(data: CreateSaleBody, createdByUserId: string) {
    const shift = await shiftsRepository.findOpenByUserId(createdByUserId);
    if (!shift)
      throw new BadRequestError("Open a shift before creating a sale");

    if (data.paymentMethod === "CHARGE_TO_ROOM") {
      if (!data.chargeToRoomBookingId) {
        throw new BadRequestError(
          "chargeToRoomBookingId is required for CHARGE_TO_ROOM payment",
        );
      }
      const booking = await bookingsRepository.findById(
        data.chargeToRoomBookingId,
      );
      if (!booking) throw new NotFoundError("Booking not found");
      if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
        throw new BadRequestError(
          "Booking is not currently active — cannot charge to this room",
        );
      }
    }

    const result = await database.$transaction(async (tx) => {
      const productIds = data.items.map((i) => i.productId);
      const products = await ordersRepository.findProductsByIds(tx, productIds);

      if (products.length !== new Set(productIds).size) {
        throw new NotFoundError("One or more products not found or inactive");
      }
      const mismatched = products.find(
        (p) => p.department !== data.sourceDepartment,
      );
      if (mismatched) {
        throw new BadRequestError(
          `Product "${mismatched.name}" does not belong to ${data.sourceDepartment}`,
        );
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      const saleItems = data.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPriceAtSale = Number(product.unitPrice);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPriceAtSale,
          lineTotal: unitPriceAtSale * item.quantity,
        };
      });
      const totalAmount = saleItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0,
      );

      const sale = await ordersRepository.createSale(
        tx,
        {
          sourceDepartment: data.sourceDepartment,
          totalAmount,
          paymentMethod: data.paymentMethod,
          ...(data.chargeToRoomBookingId && {
            chargeToRoomBooking: {
              connect: { id: data.chargeToRoomBookingId },
            },
          }),
          shift: { connect: { id: shift.id } },
          createdBy: { connect: { id: createdByUserId } },
        },
        saleItems,
      );

      await stockService.deductForSale(
        tx,
        data.items.map((item) => ({
          productId: item.productId,
          department: data.sourceDepartment,
          quantity: item.quantity,
          saleId: sale.id,
        })),
        createdByUserId,
      );

      let kitchenOrder = null;
      if (data.sourceDepartment === "RESTAURANT") {
        kitchenOrder = await ordersRepository.createKitchenOrder(
          tx,
          sale.id,
          createdByUserId,
          saleItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceAtOrder: item.unitPriceAtSale,
          })),
        );
      }

      return { sale, kitchenOrder };
    });

    eventBus.emit("sale.created", {
      saleId: result.sale.id,
      actorUserId: createdByUserId,
      sourceDepartment: data.sourceDepartment,
      totalAmount: result.sale.totalAmount,
      paymentMethod: data.paymentMethod,
      kitchenOrderId: result.kitchenOrder?.id ?? null,
    });

    return result;
  },

  async getById(id: string) {
    const sale = await ordersRepository.findSaleById(id);
    if (!sale) throw new NotFoundError("Sale not found");
    return sale;
  },

  async list(filters: ListSalesQuery) {
    return ordersRepository.listSales(compact(filters));
  },

  async requestVoid(
    id: string,
    actorUserId: string,
    permission: Permissions,
    voidReason: string,
  ) {
    const sale = await ordersService.getById(id);
    if (sale.status !== "COMPLETED") {
      throw new BadRequestError(
        "Only completed sales can have a void requested",
      );
    }
    if (permission.cannot("void", subject("Sale", sale))) {
      throw new ForbiddenError("You cannot void this sale");
    }

    const updated = await ordersRepository.requestVoid(
      id,
      actorUserId,
      voidReason,
    );

    eventBus.emit("sale.voidRequested", {
      saleId: id,
      actorUserId,
      sourceDepartment: sale.sourceDepartment,
      totalAmount: sale.totalAmount,
      voidReason,
    });

    return updated;
  },

  // GM-only in practice: GM has manage:all → can("void"); staff's void rule is
  // department-scoped and OWNER has no void grant at all, so this naturally
  // locks out both staff (wrong department never applies here, but same-department
  // staff still shouldn't approve their own request) and OWNER.
  async approveVoid(
    id: string,
    approvedByUserId: string,
    permission: Permissions,
  ) {
    const sale = await ordersService.getById(id);
    if (sale.status !== "VOID_REQUESTED") {
      throw new BadRequestError("Sale does not have a pending void request");
    }
    if (permission.cannot("void", subject("Sale", sale))) {
      throw new ForbiddenError("You cannot approve this void");
    }
    if (sale.voidedByUserId === approvedByUserId) {
      throw new ForbiddenError(
        "You cannot approve a void you requested yourself",
      );
    }

    const updated = await database.$transaction(async (tx) => {
      const result = await ordersRepository.approveVoid(
        tx,
        id,
        approvedByUserId,
      );

      await stockService.reverseForVoid(
        tx,
        sale.items.map((item) => ({
          productId: item.productId,
          department: sale.sourceDepartment,
          quantity: item.quantity,
          saleId: id,
        })),
        approvedByUserId,
      );

      if (sale.kitchenOrder) {
        await ordersRepository.voidKitchenOrder(tx, id);
      }

      return result;
    });

    eventBus.emit("sale.voidApproved", {
      saleId: id,
      actorUserId: approvedByUserId,
      requestedByUserId: sale.voidedByUserId!,
      sourceDepartment: sale.sourceDepartment,
      totalAmount: sale.totalAmount,
    });

    return updated;
  },

  async settle(id: string, settledByUserId: string, permission: Permissions) {
    const sale = await ordersService.getById(id);
    if (sale.paymentMethod !== "CHARGE_TO_ROOM") {
      throw new BadRequestError(
        "Only charge-to-room sales can be settled this way",
      );
    }
    if (permission.cannot("update", subject("Sale", sale))) {
      throw new ForbiddenError("You cannot settle this sale");
    }
    if (sale.paymentState === "PAID") {
      throw new BadRequestError("Sale is already settled");
    }
    if (sale.status !== "COMPLETED") {
      throw new BadRequestError(
        "Cannot settle a voided or void-requested sale",
      );
    }

    const updated = await ordersRepository.settle(id, settledByUserId);

    eventBus.emit("sale.settled", {
      saleId: id,
      actorUserId: settledByUserId,
      chargeToRoomBookingId: sale.chargeToRoomBookingId!,
      totalAmount: sale.totalAmount,
    });

    return updated;
  },

  async getKitchenOrderById(id: string) {
    const kitchenOrder = await ordersRepository.findKitchenOrderById(id);
    if (!kitchenOrder) throw new NotFoundError("Kitchen order not found");
    return kitchenOrder;
  },

  async listKitchenOrders(filters: ListKitchenOrdersQuery) {
    return ordersRepository.listKitchenOrders(compact(filters));
  },

  async updateKitchenOrderStatus(
    id: string,
    data: UpdateKitchenOrderStatusBody,
  ) {
    const kitchenOrder = await ordersService.getKitchenOrderById(id);
    if (
      kitchenOrder.status === "VOIDED" ||
      kitchenOrder.status === "DELIVERED"
    ) {
      throw new BadRequestError(
        `Cannot transition a ${kitchenOrder.status} kitchen order`,
      );
    }
    const updated = await ordersRepository.updateKitchenOrderStatus(
      id,
      data.status,
    );

    eventBus.emit("kitchenOrder.statusChanged", {
      orderId: id,
      destination: kitchenOrder.destination,
      status: data.status,
    });

    return updated;
  },
};
