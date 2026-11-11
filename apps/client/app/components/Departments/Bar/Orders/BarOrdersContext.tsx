import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { MOCK_INCOMING_ORDERS } from "./mockOrders";
import type { BarIncomingOrder } from "../types";

interface BarOrdersContextValue {
  orders: BarIncomingOrder[];
  markDelivered: (id: string) => void;
}

const BarOrdersContext = createContext<BarOrdersContextValue | null>(null);

export function BarOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState(MOCK_INCOMING_ORDERS);
  const value = useMemo(() => ({
    orders,
    markDelivered: (id: string) => setOrders((current) => current.map((order) => order.id === id && order.status === "Pending" ? { ...order, status: "Delivered" } : order)),
  }), [orders]);
  return <BarOrdersContext.Provider value={value}>{children}</BarOrdersContext.Provider>;
}

export function useBarOrders() {
  const value = useContext(BarOrdersContext);
  if (!value) throw new Error("useBarOrders must be used within BarOrdersProvider");
  return value;
}
