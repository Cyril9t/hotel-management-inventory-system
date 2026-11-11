import test from "node:test";
import assert from "node:assert/strict";
import {
  getKitchenOrderDetails,
  getNextKitchenOrderStatus,
  listKitchenOrders,
  updateKitchenOrderStatus,
} from "../app/services/kitchen.ts";
import {
  acknowledgeKitchenMovement,
  listStockMovements,
} from "../app/services/stock.ts";
import {
  closeShift,
  getCurrentShift,
  openShift,
} from "../app/services/shifts.ts";

const order = {
  id: "order-1",
  saleId: "sale-1",
  destination: "Room 204",
  status: "INCOMING",
  createdByUserId: "user-1",
  createdAt: "2026-11-10T08:30:00.000Z",
  items: [{
    id: "line-1",
    kitchenOrderId: "order-1",
    productId: "product-1",
    quantity: 2,
    unitPriceAtOrder: "12.50",
  }],
};

const stockProduct = {
  id: "product-1",
  name: "Rice",
  department: "RESTAURANT",
  unitPrice: "12.50",
  lowStockThreshold: 3,
  isActive: true,
  createdByUserId: "user-1",
  createdAt: "2026-11-01T08:30:00.000Z",
};

const movement = {
  id: "movement-1",
  productId: "product-1",
  movementType: "ISSUE",
  fromDepartment: "STORE",
  toDepartment: "KITCHEN",
  quantity: 5,
  actorUserId: "user-1",
  saleId: null,
  kitchenOrderId: null,
  correctionReason: null,
  acknowledgedAt: null,
  acknowledgedByUserId: null,
  acknowledgedQuantity: null,
  createdAt: "2026-11-10T08:30:00.000Z",
};

test("lists documented Kitchen orders and reads individual product details", async () => {
  const calls = [];
  const api = {
    get: async (path) => {
      calls.push(path);
      if (path === "/orders/kitchen-orders") {
        return { data: { success: true, data: { kitchenOrders: [order] } } };
      }
      return {
        data: {
          success: true,
          data: {
            kitchenOrder: {
              ...order,
              items: [{ ...order.items[0], product: { id: "product-1", name: "Rice" } }],
              sale: { id: "sale-1", sourceDepartment: "RESTAURANT" },
            },
          },
        },
      };
    },
  };

  const orders = await listKitchenOrders(api);
  const details = await getKitchenOrderDetails(api, "order/1");

  assert.deepEqual(calls, ["/orders/kitchen-orders", "/orders/kitchen-orders/order%2F1"]);
  assert.equal(orders[0].items[0].product, undefined);
  assert.equal(details.items[0].product.name, "Rice");
  assert.equal(details.sale.sourceDepartment, "RESTAURANT");
});

test("allows only the documented forward order status transitions", () => {
  assert.equal(getNextKitchenOrderStatus("INCOMING"), "PREPARING");
  assert.equal(getNextKitchenOrderStatus("PREPARING"), "READY");
  assert.equal(getNextKitchenOrderStatus("READY"), "DELIVERED");
  assert.equal(getNextKitchenOrderStatus("DELIVERED"), null);
  assert.equal(getNextKitchenOrderStatus("VOIDED"), null);
});

test("sends the documented Kitchen order status patch", async () => {
  let call;
  const api = { patch: async (...args) => { call = args; } };
  await updateKitchenOrderStatus(api, "order/1", "PREPARING");
  assert.deepEqual(call, ["/orders/kitchen-orders/order%2F1/status", { status: "PREPARING" }]);
});

test("requests Kitchen stock issues and records an acknowledged quantity", async () => {
  const getCalls = [];
  let patchCall;
  const api = {
    get: async (...args) => {
      getCalls.push(args);
      return {
        data: {
          success: true,
          data: {
            movements: [{ ...movement, product: stockProduct, actor: { id: "user-1" } }],
          },
        },
      };
    },
    patch: async (...args) => {
      patchCall = args;
      return { data: { success: true, data: { movement: { ...movement, acknowledgedQuantity: 4, acknowledgedAt: "2026-11-10T08:45:00.000Z", acknowledgedByUserId: "user-1" } } } };
    },
  };

  const movements = await listStockMovements(api, { department: "KITCHEN", movementType: "ISSUE" });
  const acknowledged = await acknowledgeKitchenMovement(api, "movement/1", 4);

  assert.deepEqual(getCalls, [["/stock/movements", { params: { department: "KITCHEN", movementType: "ISSUE" } }]]);
  assert.equal(movements[0].product.name, "Rice");
  assert.deepEqual(patchCall, ["/stock/movements/movement%2F1/acknowledge", { acknowledgedQuantity: 4 }]);
  assert.equal(acknowledged.acknowledgedQuantity, 4);
});

test("reuses the existing shift endpoints and records Kitchen shifts without cash", async () => {
  const calls = [];
  const api = {
    get: async (path) => {
      calls.push(["GET", path]);
      return { data: { success: true, data: { shift: { id: "shift-1", department: "KITCHEN", status: "OPEN" } } } };
    },
    post: async (...args) => {
      calls.push(["POST", ...args]);
      return { data: { success: true, data: { shift: { id: "shift-1", department: "KITCHEN", status: "OPEN" } } } };
    },
    patch: async (...args) => {
      calls.push(["PATCH", ...args]);
      return { data: { success: true, data: { shift: { id: "shift-1", department: "KITCHEN", status: "CLOSED" } } } };
    },
  };

  assert.equal((await getCurrentShift(api)).department, "KITCHEN");
  await openShift(api, 0);
  await closeShift(api, "shift/1", 0);

  assert.deepEqual(calls, [
    ["GET", "/shifts/current"],
    ["POST", "/shifts/open", { openingCash: 0 }],
    ["PATCH", "/shifts/shift%2F1/close", { actualCash: 0 }],
  ]);
});
