import { database } from "#shared/database/prisma";
import type { BookingStatus, Prisma } from "@prisma/client";

const ACTIVE_BOOKING_STATUSES = [
  "RESERVED",
  "CHECKED_IN",
  "CHECKOUT_DUE",
  "OVERDUE",
] as BookingStatus[];

export const roomsRepository = {
  async findMany() {
    return database.room.findMany({
      include: {
        category: true,
        bookings: {
          where: { status: { in: ACTIVE_BOOKING_STATUSES } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { number: "asc" },
    });
  },

  async findById(id: string) {
    return database.room.findUnique({
      where: { id },
      include: {
        category: true,
        bookings: {
          where: { status: { in: ACTIVE_BOOKING_STATUSES } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  },

  async create(data: Prisma.RoomCreateInput) {
    return database.room.create({ data, include: { category: true } });
  },

  async update(id: string, data: Prisma.RoomUpdateInput) {
    return database.room.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async deactivate(id: string) {
    return database.room.update({ where: { id }, data: { isActive: false } });
  },

  async reactivate(id: string) {
    return database.room.update({ where: { id }, data: { isActive: true } });
  },

  async findCategoryById(id: string) {
    return database.roomCategory.findUnique({ where: { id } });
  },

  async updateCategoryPrice(id: string, price: number) {
    return database.roomCategory.update({
      where: { id },
      data: { pricePerNight: price },
    });
  },
};
