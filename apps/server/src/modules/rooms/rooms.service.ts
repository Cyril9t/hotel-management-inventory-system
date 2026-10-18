import { NotFoundError, BadRequestError } from "#shared/errors/http-errors";
import { compact } from "#shared/utils/omit-undefined";
import { roomsRepository } from "./rooms.repository";
import { auditService } from "#modules/audit/audit.service";
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
    await auditService.log({
      actorUserId,
      action: "room_deactivated",
      entityType: "Room",
      entityId: id,
      beforeValue: { isActive: room.isActive },
      afterValue: { isActive: false },
    });
    return updated;
  },

  async reactivate(id: string, actorUserId: string) {
    const room = await roomsService.getById(id);
    const updated = await roomsRepository.reactivate(id);
    await auditService.log({
      actorUserId,
      action: "room_reactivated",
      entityType: "Room",
      entityId: id,
      beforeValue: { isActive: room.isActive },
      afterValue: { isActive: true },
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
    await auditService.log({
      actorUserId,
      action: "room_category_price_changed",
      entityType: "RoomCategory",
      entityId: categoryId,
      beforeValue: { pricePerNight: category.pricePerNight },
      afterValue: { pricePerNight: price },
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

    await auditService.log({
      actorUserId,
      action: "room_category_name_changed",
      entityType: "RoomCategory",
      entityId: categoryId,
      beforeValue: { name: category.name },
      afterValue: { name },
    });

    return updated;
  },

  async createCategory(data: CreateCategoryBody) {
    const existing = await roomsRepository.findCategoryByName(data.name);
    if (existing)
      throw new BadRequestError("A category with that name already exists");
    return roomsRepository.createCategory(data);
  },

  async bulkCreateRooms(data: BulkCreateRoomsBody) {
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

    return {
      requested: numbers.length,
      created: result.count,
      skipped: numbers.length - result.count,
    };
  },
};
