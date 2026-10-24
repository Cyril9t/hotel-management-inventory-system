import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import type { Subjects } from "@casl/prisma";
import type {
  Room,
  RoomCategory,
  Booking,
  Shift,
  Sale,
  KitchenOrder,
  Product,
  StockBalance,
  StockMovement,
  User,
  StaffInvite,
  AuditLog,
  DailyReportSnapshot,
} from "@prisma/client";
import type { AccessTokenPayload } from "./jwt";

type Models = {
  Room: Room;
  RoomCategory: RoomCategory;
  Booking: Booking;
  Shift: Shift;
  Sale: Sale;
  KitchenOrder: KitchenOrder;
  Product: Product;
  StockBalance: StockBalance;
  StockMovement: StockMovement;
  User: User;
  StaffInvite: StaffInvite;
  AuditLog: AuditLog;
  DailyReportSnapshot: DailyReportSnapshot;
};

export type Permission =
  | ["manage" | "read", "all"]
  | ["create" | "read" | "update", Subjects<Pick<Models, "Room">>]
  | ["create" | "read" | "update", Subjects<Pick<Models, "RoomCategory">>]
  | ["create" | "read" | "update", Subjects<Pick<Models, "Booking">>]
  | ["create" | "read" | "update", Subjects<Pick<Models, "Shift">>]
  | ["create" | "read" | "update" | "void", Subjects<Pick<Models, "Sale">>]
  | ["create" | "read" | "update", Subjects<Pick<Models, "KitchenOrder">>]
  | ["manage" | "read", Subjects<Pick<Models, "Product">>]
  | ["read" | "update" | "manage", Subjects<Pick<Models, "StockMovement">>]
  | ["manage", Subjects<Pick<Models, "StockBalance">>]
  | ["create" | "read" | "update", Subjects<Pick<Models, "StaffInvite">>]
  | ["read" | "update", Subjects<Pick<Models, "User">>]
  | ["read", Subjects<Pick<Models, "AuditLog">>]
  | ["read", Subjects<Pick<Models, "DailyReportSnapshot">>];

export type Permissions = MongoAbility<Permission>;

export function getPermissions(user: AccessTokenPayload) {
  const { can, cannot, build } = new AbilityBuilder<Permissions>(
    createMongoAbility,
  );

  // if (user === undefined) {
  //   can("read", "Booking");
  //   return build();
  // }

  switch (user.role) {
    case "OWNER":
      can("read", "all");
      can("create", "StaffInvite", { role: "GENERAL_MANAGER" });
      break;

    case "GENERAL_MANAGER":
      can("manage", "all");
      cannot("create", "StaffInvite", { role: "OWNER" });
      break;

    case "RECEPTIONIST":
      can(["create", "read", "update"], "Booking");
      can("read", ["Room", "RoomCategory"]);
      can(["create", "read", "update"], "Shift", { userId: user.userId });
      can("update", "Sale", { paymentMethod: "CHARGE_TO_ROOM" });
      break;

    case "BAR_STAFF":
      can(["create", "read"], "Sale", { sourceDepartment: "BAR" });
      can("void", "Sale", { sourceDepartment: "BAR" });
      can("read", "Product", { department: "BAR" });
      can(["create", "read", "update"], "Shift", { userId: user.userId });
      break;

    case "RESTAURANT_STAFF":
      can(["create", "read"], "Sale", { sourceDepartment: "RESTAURANT" });
      can("void", "Sale", { sourceDepartment: "RESTAURANT" });
      can("read", "Product", { department: "RESTAURANT" });
      can(["create", "read", "update"], "KitchenOrder");
      can(["create", "read", "update"], "Shift", { userId: user.userId });
      break;

    case "KITCHEN_STAFF":
      can(["read", "update"], "KitchenOrder");
      can(["read", "update"], "StockMovement", { toDepartment: "KITCHEN" });
      can(["create", "read", "update"], "Shift", { userId: user.userId });
      break;

    case "STORE_MANAGER":
      can("manage", ["Product", "StockBalance", "StockMovement"]);
      can(["create", "read", "update"], "Shift", { userId: user.userId });
      // can("read", "DailyReportSnapshot", { department: "STORE" });
      break;
  }

  return build();
}
