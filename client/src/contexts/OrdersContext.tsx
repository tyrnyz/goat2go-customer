import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGuestSession } from "./GuestSessionContext";
import { fetchOrdersBySession } from "@/lib/orderService";
import type { DbOrder } from "@/types/database";

interface OrdersContextType {
  orders: DbOrder[];
  refreshOrders: () => Promise<void>;
  getOrderById: (orderId: number) => DbOrder | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { sessionId } = useGuestSession();
  const [orders, setOrders] = useState<DbOrder[]>([]);

  const loadOrders = async () => {
    if (!sessionId) return;
    const fetched = await fetchOrdersBySession(sessionId);
    setOrders(fetched);
  };

  useEffect(() => {
    if (sessionId) {
      loadOrders();
    }
  }, [sessionId]);

  const refreshOrders = async () => {
    await loadOrders();
  };

  const getOrderById = (orderId: number): DbOrder | undefined => {
    return orders.find((order) => order.orderID === orderId);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        refreshOrders,
        getOrderById,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return context;
}
