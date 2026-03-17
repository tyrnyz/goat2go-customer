import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGuestSession } from "./GuestSessionContext";
import { Order, OrderHistory } from "@shared/types";

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { sessionId } = useGuestSession();
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const ordersKey = `orders_${sessionId}`;
    const savedOrders = localStorage.getItem(ordersKey);

    if (savedOrders) {
      try {
        const orderHistory: OrderHistory = JSON.parse(savedOrders);
        setOrders(orderHistory.orders);
      } catch {
        setOrders([]);
      }
    }
  }, [sessionId]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    const ordersKey = `orders_${sessionId}`;
    const orderHistory: OrderHistory = { orders };
    localStorage.setItem(ordersKey, JSON.stringify(orderHistory));
  }, [orders, sessionId]);

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId ? { ...order, status } : order
      )
    );
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.orderId === orderId);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
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
