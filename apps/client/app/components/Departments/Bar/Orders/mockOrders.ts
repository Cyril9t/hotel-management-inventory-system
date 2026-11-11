import type { BarIncomingOrder } from "../types";

export const MOCK_INCOMING_ORDERS: BarIncomingOrder[] = [
  { id: "ord-1", reference: "BR-2026-0148", source: "Poolside", createdAt: "2026-11-11T13:42:00Z", status: "Pending", items: [{ id: "i-1", name: "Heineken Lager", quantity: 3, unitPrice: 2500 }, { id: "i-2", name: "Coca-Cola Classic", quantity: 2, unitPrice: 1200 }], totalAmount: 9900 },
  { id: "ord-2", reference: "BR-2026-0147", source: "Room 304", createdAt: "2026-11-11T13:26:00Z", status: "Pending", items: [{ id: "i-3", name: "Classic Mojito", quantity: 2, unitPrice: 5500 }, { id: "i-4", name: "Roasted Salted Cashew Nuts", quantity: 1, unitPrice: 3500 }], totalAmount: 14500 },
  { id: "ord-3", reference: "BR-2026-0146", source: "Restaurant", createdAt: "2026-11-11T13:08:00Z", status: "Delivered", items: [{ id: "i-5", name: "Guinness Extra Stout", quantity: 4, unitPrice: 2800 }], totalAmount: 11200 },
  { id: "ord-4", reference: "BR-2026-0145", source: "Room 112", createdAt: "2026-11-11T12:51:00Z", status: "Pending", items: [{ id: "i-6", name: "Freshly Squeezed Orange Juice", quantity: 2, unitPrice: 3500 }, { id: "i-7", name: "Spicy Peppered Gizzard", quantity: 1, unitPrice: 5500 }], totalAmount: 12500 },
  { id: "ord-5", reference: "BR-2026-0144", source: "Events Lounge", createdAt: "2026-11-11T12:34:00Z", status: "Delivered", items: [{ id: "i-8", name: "Nederburg Cabernet Sauvignon", quantity: 1, unitPrice: 24000 }], totalAmount: 24000 },
];
