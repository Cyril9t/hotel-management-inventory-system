import type { Request, Response } from "express";
import { roomsService } from "./rooms.service";
import { success } from "#shared/utils/api-response";
import type {
  CreateRoomBody,
  UpdateRoomBody,
  RoomIdParams,
  CategoryIdParams,
  UpdateCategoryPriceBody,
  UpdateCategoryNameBody,
  CreateCategoryBody,
  BulkCreateRoomsBody,
} from "./rooms.schema";

export const roomsController = {
  async list(req: Request, res: Response) {
    res.json(
      success({
        rooms: await roomsService.list(),
      }),
    );
  },

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(
      success({
        room: await roomsService.getById(id),
      }),
    );
  },

  async create(req: Request<unknown, unknown, CreateRoomBody>, res: Response) {
    res.status(201).json(
      success({
        room: await roomsService.create(req.body),
      }),
    );
  },

  async update(req: Request<unknown, unknown, UpdateRoomBody>, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(
      success({
        room: await roomsService.update(id, req.body),
      }),
    );
  },

  async deactivate(req: Request, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(
      success({
        room: await roomsService.deactivate(id, req.user!.userId),
      }),
    );
  },

  async reactivate(req: Request, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(
      success({
        room: await roomsService.reactivate(id, req.user!.userId),
      }),
    );
  },

  async updateCategoryPrice(
    req: Request<unknown, unknown, UpdateCategoryPriceBody>,
    res: Response,
  ) {
    const { categoryId } = res.locals.params as CategoryIdParams;
    res.json(
      success({
        room: await roomsService.updateCategoryPrice(
          categoryId,
          req.body.price,
          req.user!.userId,
        ),
      }),
    );
  },

  async updateCategoryName(
    req: Request<unknown, unknown, UpdateCategoryNameBody>,
    res: Response,
  ) {
    const { categoryId } = res.locals.params as CategoryIdParams;
    const { name } = req.body;
    const updated = await roomsService.updateCategoryName(
      categoryId,
      name,
      req.user!.userId,
    );
    res.json(
      success({
        category: updated,
      }),
    );
  },

  async listCategories(_req: Request, res: Response) {
    const categories = await roomsService.listCategories();
    res.json(success({ categories }));
  },

  async createCategory(
    req: Request<unknown, unknown, CreateCategoryBody>,
    res: Response,
  ) {
    res.status(201).json(
      success({
        category: await roomsService.createCategory(req.body),
      }),
    );
  },

  async bulkCreateRooms(
    req: Request<unknown, unknown, BulkCreateRoomsBody>,
    res: Response,
  ) {
    res.status(201).json(success(await roomsService.bulkCreateRooms(req.body)));
  },
};
