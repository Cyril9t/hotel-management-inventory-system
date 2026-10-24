import { database } from "#shared/database/prisma";
import type {
  Department,
  KitchenOrderStatus,
  PaymentMethod,
  Prisma,
  SaleStatus,
} from "@prisma/client";

export const ordersRepository = {
  async findProductsByIds(tx: Prisma.TransactionClient, ids: string[]) {
    return tx.product.findMany({ where: { id: { in: ids }, isActive: true } });
  },

  async createSale(
    tx: Prisma.TransactionClient,
    data: Prisma.SaleCreateInput,
    items: {
      productId: string;
      quantity: number;
      unitPriceAtSale: number;
      lineTotal: number;
    }[],
  ) {
    const sale = await tx.sale.create({ data });
    await tx.saleItem.createMany({
      data: items.map((item) => ({ ...item, saleId: sale.id })),
    });
    return sale;
  },

  async createKitchenOrder(
    tx: Prisma.TransactionClient,
    saleId: string,
    createdByUserId: string,
    items: { productId: string; quantity: number; unitPriceAtOrder: number }[],
  ) {
    const kitchenOrder = await tx.kitchenOrder.create({
      data: {
        sale: { connect: { id: saleId } },
        destination: "KITCHEN",
        createdBy: { connect: { id: createdByUserId } },
      },
    });
    await tx.kitchenOrderItem.createMany({
      data: items.map((item) => ({ ...item, kitchenOrderId: kitchenOrder.id })),
    });
    return kitchenOrder;
  },

  async findSaleById(id: string) {
    return database.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, kitchenOrder: true },
    });
  },

  async listSales(filters: {
    sourceDepartment?: Department;
    status?: SaleStatus;
    paymentState?: "UNPAID" | "PAID";
    startDate?: Date;
    endDate?: Date;
  }) {
    const { startDate, endDate, ...rest } = filters;
    return database.sale.findMany({
      where: {
        ...rest,
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async requestVoid(id: string, voidedByUserId: string, voidReason: string) {
    return database.sale.update({
      where: { id },
      data: {
        status: "VOID_REQUESTED",
        voidedByUserId,
        voidReason,
        voidedAt: new Date(),
      },
    });
  },

  async approveVoid(
    tx: Prisma.TransactionClient,
    id: string,
    approvedByUserId: string,
  ) {
    return tx.sale.update({
      where: { id },
      data: { status: "VOIDED", approvedByUserId },
    });
  },

  async settle(id: string, settledByUserId: string) {
    return database.sale.update({
      where: { id },
      data: { paymentState: "PAID", settledAt: new Date(), settledByUserId },
    });
  },

  async findKitchenOrderById(id: string) {
    return database.kitchenOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, sale: true },
    });
  },

  async listKitchenOrders(filters: {
    status?: KitchenOrderStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { startDate, endDate, ...rest } = filters;
    return database.kitchenOrder.findMany({
      where: {
        ...rest,
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async updateKitchenOrderStatus(id: string, status: KitchenOrderStatus) {
    return database.kitchenOrder.update({ where: { id }, data: { status } });
  },

  async voidKitchenOrder(tx: Prisma.TransactionClient, saleId: string) {
    return tx.kitchenOrder.updateMany({
      where: { saleId },
      data: { status: "VOIDED" },
    });
  },
};
