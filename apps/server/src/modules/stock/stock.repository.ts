import { database } from "#shared/database/prisma";
import type { Department, Prisma, StockMovementType } from "@prisma/client";

export const stockRepository = {
  // ---- Products ----
  async createProduct(data: Prisma.ProductCreateInput) {
    return database.product.create({ data });
  },

  async findProductById(id: string) {
    return database.product.findUnique({ where: { id } });
  },

  async listProducts(filters: { department?: Department; isActive?: boolean }) {
    return database.product.findMany({
      where: filters,
      orderBy: { name: "asc" },
    });
  },

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return database.product.update({ where: { id }, data });
  },

  async deactivateProduct(id: string) {
    return database.product.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async reactivateProduct(id: string) {
    return database.product.update({ where: { id }, data: { isActive: true } });
  },

  // ---- Balances ----
  async listBalances(filters: { productId?: string; department?: Department }) {
    return database.stockBalance.findMany({
      where: filters,
      include: { product: true },
      orderBy: { product: { name: "asc" } },
    });
  },

  async creditBalance(
    tx: Prisma.TransactionClient,
    productId: string,
    department: Department,
    quantity: number,
  ) {
    return tx.stockBalance.upsert({
      where: { productId_department: { productId, department } },
      create: { productId, department, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  // Atomic conditional decrement — one UPDATE statement guarded by quantity >= x,
  // avoids going negative under concurrent writes without an explicit row lock.
  async debitBalance(
    tx: Prisma.TransactionClient,
    productId: string,
    department: Department,
    quantity: number,
  ) {
    const result = await tx.stockBalance.updateMany({
      where: { productId, department, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    return result.count === 1;
  },

  // ---- Movements ----
  async createMovement(
    tx: Prisma.TransactionClient,
    data: Prisma.StockMovementCreateInput,
  ) {
    return tx.stockMovement.create({ data });
  },

  async findMovementById(id: string) {
    return database.stockMovement.findUnique({ where: { id } });
  },

  async listMovements(filters: {
    productId?: string;
    movementType?: StockMovementType;
    department?: Department;
  }) {
    const { department, ...rest } = filters;
    return database.stockMovement.findMany({
      where: {
        ...rest,
        ...(department && {
          OR: [{ fromDepartment: department }, { toDepartment: department }],
        }),
      },
      include: { product: true, actor: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
