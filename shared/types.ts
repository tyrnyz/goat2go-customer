// Guest Session Types
export interface GuestSession {
  sessionId: string;
  createdAt: number;
  orderType: "dine-in" | "take-out" | null;
  isActive: boolean;
}

// Cart Types
export interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  addOns: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  selectedVariant?: {
    id: string;
    name: string;
  };
}

// Order Types
export type OrderType = "dine-in" | "take-out";
export type DiscountType = "none" | "pwd" | "senior";
export type OrderStatus = "pending" | "preparing" | "ready" | "completed";

export interface Order {
  orderId: string;
  queueNumber: string;
  sessionId: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  discount: {
    type: DiscountType;
    percentage: number;
    amount: number;
  };
  total: number;
  status: OrderStatus;
  createdAt: number;
  completedAt?: number;
}

export interface OrderHistory {
  orders: Order[];
}
