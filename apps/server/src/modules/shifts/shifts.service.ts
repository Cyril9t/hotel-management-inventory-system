import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "#shared/errors/http-errors";
import { shiftsRepository } from "./shifts.repository";
import { roomsService } from "#modules/rooms/rooms.service";
import { auditService } from "#modules/audit/audit.service";
import type { Department } from "@prisma/client";
import type { Permissions } from "#shared/lib/ability";
import type {
  OpenShiftBody,
  CloseShiftBody,
  ListShiftsQuery,
} from "./shifts.schema";

async function captureRoomSnapshot() {
  const rooms = await roomsService.list();
  return rooms.map(({ id, number, status }) => ({ id, number, status }));
}

export const shiftsService = {
  async getCurrent(userId: string) {
    const shift = await shiftsRepository.findOpenByUserId(userId);
    if (!shift) throw new NotFoundError("No open shift found");
    return shift;
  },

  async getSuggestedOpeningCash(userId: string) {
    const lastShift = await shiftsRepository.findLastClosedByUserId(userId);
    return { suggestedOpeningCash: lastShift?.actualCash ?? 0 };
  },

  async open(userId: string, department: Department, data: OpenShiftBody) {
    const existing = await shiftsRepository.findOpenByUserId(userId);
    if (existing) throw new BadRequestError("You already have an open shift");

    const shift = await shiftsRepository.create({
      user: { connect: { id: userId } },
      department,
      openingCash: data.openingCash,
    });

    if (department === "RECEPTION") {
      const roomSnapshotOpen = await captureRoomSnapshot();
      await shiftsRepository.createSnapshot(shift.id, roomSnapshotOpen);
    }

    return shift;
  },

  async close(
    shiftId: string,
    actorUserId: string,
    permission: Permissions,
    data: CloseShiftBody,
  ) {
    const shift = await shiftsRepository.findById(shiftId);
    if (!shift) throw new NotFoundError("Shift not found");
    if (shift.status === "CLOSED")
      throw new BadRequestError("Shift is already closed");

    // Instance-level check: evaluates the { userId } condition from ability.ts
    // against this specific shift, not just a type-level "does Shift exist" check.
    if (permission.cannot("update", shift)) {
      throw new ForbiddenError("You cannot close this shift");
    }

    const expectedCash = await shiftsRepository.computeExpectedCash(shiftId);
    const variance = data.actualCash - expectedCash;

    const updated = await shiftsRepository.close(shiftId, {
      actualCash: data.actualCash,
      expectedCash,
      variance,
    });

    if (shift.department === "RECEPTION") {
      const roomSnapshotClose = await captureRoomSnapshot();
      await shiftsRepository.closeSnapshot(shiftId, roomSnapshotClose);
    }

    await auditService.log({
      actorUserId,
      action: "shift_closed",
      entityType: "Shift",
      entityId: shiftId,
      beforeValue: { status: shift.status, openingCash: shift.openingCash },
      afterValue: {
        status: "CLOSED",
        actualCash: data.actualCash,
        expectedCash,
        variance,
      },
    });

    return updated;
  },

  async getById(id: string, permission: Permissions) {
    const shift = await shiftsRepository.findById(id);
    if (!shift) throw new NotFoundError("Shift not found");
    if (permission.cannot("read", shift)) {
      throw new ForbiddenError("You cannot view this shift");
    }
    return shift;
  },

  async list(
    filters: ListShiftsQuery,
    actorUserId: string,
    permission: Permissions,
  ) {
    // Staff only have a conditioned ("own shift") read rule, not blanket "read all" —
    // so unless the actor's ability actually covers "all", force the query to their own.
    const canReadAll = permission.can("read", "all");
    const scopedFilters = canReadAll
      ? filters
      : { ...filters, userId: actorUserId };
    return shiftsRepository.findMany(scopedFilters);
  },
};
