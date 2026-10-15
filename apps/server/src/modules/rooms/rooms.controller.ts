import type { Request, Response } from "express";
import { roomsService } from "./rooms.service";
import { success } from "#shared/utils/api-response";
import type {
  CreateRoomBody,
  UpdateRoomBody,
  RoomIdParams,
  CategoryIdParams,
  UpdateCategoryPriceBody,
} from "./rooms.schema";

export const roomsController = {
  async list(req: Request, res: Response) {
    res.json(success(await roomsService.list()));
  },

  async getById(req: Request, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(success(await roomsService.getById(id)));
  },

  async create(req: Request<unknown, unknown, CreateRoomBody>, res: Response) {
    res.status(201).json(success(await roomsService.create(req.body)));
  },

  async update(req: Request<unknown, unknown, UpdateRoomBody>, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(success(await roomsService.update(id, req.body)));
  },

  async deactivate(req: Request, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(success(await roomsService.deactivate(id)));
  },

  async reactivate(req: Request, res: Response) {
    const { id } = res.locals.params as RoomIdParams;
    res.json(success(await roomsService.reactivate(id)));
  },

  async updateCategoryPrice(
    req: Request<unknown, unknown, UpdateCategoryPriceBody>,
    res: Response,
  ) {
    const { categoryId } = res.locals.params as CategoryIdParams;
    res.json(
      success(
        await roomsService.updateCategoryPrice(categoryId, req.body.price),
      ),
    );
  },
};
