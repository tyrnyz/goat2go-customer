import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  addOns?: Array<{ id: string; name: string; price: number }>;
  selectedVariant?: { id: string; name: string };
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  addToCart: (item: Omit<CartItem, 'cartId'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (cartId: string, updatedItem: Omit<CartItem, 'cartId'>) => void;
  clearCart: () => void;
  orderType: string | null;
  setOrderType: (type: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<string | null>(null);

  // Dynamic subtotal calculation
  const subtotal = items.reduce((sum, item) => {
    const addOnsPrice = (item.addOns || []).reduce((a, b) => a + (b.price || 0), 0);
    return sum + (item.price + addOnsPrice) * item.quantity;
  }, 0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)); } catch (e) { console.error('Failed to parse cart'); }
    }
    const savedOrderType = localStorage.getItem('orderType');
    if (savedOrderType) setOrderType(savedOrderType);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (orderType) localStorage.setItem('orderType', orderType);
    else localStorage.removeItem('orderType');
  }, [orderType]);

  const addToCart = (item: Omit<CartItem, 'cartId'>) => {
    const newItem: CartItem = {
      ...item,
      cartId: `${item.itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setItems(prev => {
      const existingIndex = prev.findIndex(i => 
        i.itemId === item.itemId && 
        JSON.stringify(i.selectedVariant) === JSON.stringify(item.selectedVariant) &&
        JSON.stringify(i.addOns) === JSON.stringify(item.addOns)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + item.quantity };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartId: string) => setItems((prev) => prev.filter((i) => i.cartId !== cartId));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) removeFromCart(id);
    else setItems(prev => prev.map(item => item.cartId === id ? { ...item, quantity } : item));
  };

  const updateItem = (cartId: string, updatedItem: Omit<CartItem, 'cartId'>) => {
    setItems(prev => prev.map(item => item.cartId === cartId ? { ...updatedItem, cartId } : item));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, subtotal, addToCart, removeFromCart, updateQuantity, updateItem, clearCart, orderType, setOrderType }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}