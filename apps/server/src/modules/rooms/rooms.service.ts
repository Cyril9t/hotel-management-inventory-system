import { NotFoundError } from "#shared/errors/http-errors";
import { roomsRepository } from "./rooms.repository";
import type { Prisma } from "@prisma/client";
import type { CreateRoomBody, UpdateRoomBody } from "./rooms.schema";

function deriveStatus(bookings: { status: string }[]) {
  return bookings[0]?.status ?? "AVAILABLE";
}

export const roomsService = {
  async list() {
    const rooms = await roomsRepository.findMany();
    return rooms.map(({ bookings, ...room }) => ({
      ...room,
      status: deriveStatus(bookings),
    }));
  },

  async getById(id: string) {
    const room = await roomsRepository.findById(id);
    if (!room) throw new NotFoundError("Room not found");
    const { bookings, ...rest } = room;
    return { ...rest, status: deriveStatus(bookings) };
  },

  // rooms.service.ts — create/update only, rest unchanged
  async create(data: CreateRoomBody) {
    const category = await roomsRepository.findCategoryById(data.categoryId);
    if (!category) throw new NotFoundError("Room category not found");
    return roomsRepository.create({
      number: data.number,
      category: { connect: { id: data.categoryId } },
    });
  },

  async update(id: string, data: UpdateRoomBody) {
    await roomsService.getById(id);
    const { categoryId, number } = data;
    return roomsRepository.update(id, {
      ...(number !== undefined && { number }),
      ...(categoryId && { category: { connect: { id: categoryId } } }),
    });
  },

  async deactivate(id: string) {
    await roomsService.getById(id);
    const room = await roomsRepository.deactivate(id);
    // TODO: audit log — "room deactivated" is a critical event
    return room;
  },

  async reactivate(id: string) {
    await roomsService.getById(id);
    const room = await roomsRepository.reactivate(id);
    // TODO: audit log — "room reactivated" is a critical event
    return room;
  },

  async updateCategoryPrice(categoryId: string, price: number) {
    const category = await roomsRepository.findCategoryById(categoryId);
    if (!category) throw new NotFoundError("Room category not found");
    const updated = await roomsRepository.updateCategoryPrice(
      categoryId,
      price,
    );
    // TODO: audit log — "room category price changed" is a critical event
    return updated;
  },
};
