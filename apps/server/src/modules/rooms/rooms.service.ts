import { NotFoundError, BadRequestError } from "#shared/errors/http-errors";
import { compact } from "#shared/utils/omit-undefined";
import { roomsRepository } from "./rooms.repository";
import { eventBus } from "#shared/events/bus";
import type {
  BulkCreateRoomsBody,
  CreateCategoryBody,
  CreateRoomBody,
  ListRoomsQuery,
  UpdateRoomBody,
} from "./rooms.schema";

function deriveStatus(bookings: { status: string }[]) {
  return bookings[0]?.status ?? "AVAILABLE";
}

export const roomsService = {
  async list(filters: ListRoomsQuery = {}) {
    const rooms = await roomsRepository.findMany({
      categoryId: filters.categoryId,
      isActive: filters.isActive,
    });
    const withStatus = rooms.map(({ bookings, ...room }) => ({
      ...room,
      status: deriveStatus(bookings),
    }));
    return filters.status
      ? withStatus.filter((room) => room.status === filters.status)
      : withStatus;
  },

  async listCategories() {
    return roomsRepository.listCategories();
  },

  async getById(id: string) {
    const room = await roomsRepository.findById(id);
    if (!room) throw new NotFoundError("Room not found");
    const { bookings, ...rest } = room;
    return { ...rest, status: deriveStatus(bookings) };
  },

  async create(data: CreateRoomBody, actorUserId: string) {
    const category = await roomsRepository.findCategoryById(data.categoryId);
    if (!category) throw new NotFoundError("Room category not found");
    const room = await roomsRepository.create({
      number: data.number,
      category: { connect: { id: data.categoryId } },
    });

    eventBus.emit("room.created", {
      roomId: room.id,
      actorUserId,
      number: room.number,
      categoryId: data.categoryId,
    });

    return room;
  },

  async update(id: string, data: UpdateRoomBody) {
    await roomsService.getById(id);
    return roomsRepository.update(
      id,
      compact({
        number: data.number,
        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),
      }),
    );
  },

  async deactivate(id: string, actorUserId: string) {
    const room = await roomsService.getById(id);
    const updated = await roomsRepository.deactivate(id);
    eventBus.emit("room.deactivated", {
      roomId: id,
      actorUserId,
      wasActive: room.isActive,
    });
    return updated;
  },

  async reactivate(id: string, actorUserId: string) {
    const room = await roomsService.getById(id);
    const updated = await roomsRepository.reactivate(id);
    eventBus.emit("room.reactivated", {
      roomId: id,
      actorUserId,
      wasActive: room.isActive,
    });
    return updated;
  },

  async updateCategoryPrice(
    categoryId: string,
    price: number,
    actorUserId: string,
  ) {
    const category = await roomsRepository.findCategoryById(categoryId);
    if (!category) throw new NotFoundError("Room category not found");
    const updated = await roomsRepository.updateCategoryPrice(
      categoryId,
      price,
    );
    eventBus.emit("room.categoryPriceChanged", {
      categoryId,
      actorUserId,
      before: category.pricePerNight,
      after: price,
    });
    return updated;
  },

  async updateCategoryName(
    categoryId: string,
    name: string,
    actorUserId: string,
  ) {
    const category = await roomsRepository.findCategoryById(categoryId);
    if (!category) throw new NotFoundError("Room category not found");

    const existing = await roomsRepository.findCategoryByName(name);
    if (existing && existing.id !== categoryId) {
      throw new BadRequestError("A category with that name already exists");
    }

    const updated = await roomsRepository.updateCategoryName(categoryId, name);

    eventBus.emit("room.categoryNameChanged", {
      categoryId,
      actorUserId,
      before: category.name,
      after: name,
    });

    return updated;
  },

  async createCategory(data: CreateCategoryBody, actorUserId: string) {
    const existing = await roomsRepository.findCategoryByName(data.name);
    if (existing)
      throw new BadRequestError("A category with that name already exists");
    const category = await roomsRepository.createCategory(data);

    eventBus.emit("roomCategory.created", {
      categoryId: category.id,
      actorUserId,
      name: category.name,
      pricePerNight: category.pricePerNight,
    });

    return category;
  },

  async bulkCreateRooms(data: BulkCreateRoomsBody, actorUserId: string) {
    const category = await roomsRepository.findCategoryById(data.categoryId);
    if (!category) throw new NotFoundError("Room category not found");

    const wing = data.wing?.toUpperCase() ?? "";
    const floor = data.floor !== undefined ? String(data.floor) : "";

    const numbers = Array.from(
      { length: data.rangeEnd - data.rangeStart + 1 },
      (_, i) =>
        `${wing}${floor}${String(data.rangeStart + i).padStart(2, "0")}`,
    );

    const result = await roomsRepository.createMany(
      numbers.map((number) => ({ number, categoryId: data.categoryId })),
    );

    eventBus.emit("rooms.bulkCreated", {
      actorUserId,
      categoryId: data.categoryId,
      requested: numbers.length,
      created: result.count,
    });

    return {
      requested: numbers.length,
      created: result.count,
      skipped: numbers.length - result.count,
    };
  },
};
