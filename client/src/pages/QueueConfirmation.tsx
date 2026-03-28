import { useEffect, useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useGuestSession } from "@/contexts/GuestSessionContext";
import { fetchOrderById, fetchOrderItems } from "@/lib/orderService";
import type { DbOrder, DbOrderItem } from "@/types/database";
import {
  CheckCircle,
  ShoppingBag,
  Utensils,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";

const POLL_INTERVAL = 5000; // 5 seconds

export default function QueueConfirmation() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/queue-confirmation/:orderId");
  const { sessionId } = useGuestSession();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [error, setError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const orderId = params?.orderId ? parseInt(params.orderId) : null;
    if (!orderId || !sessionId) return;

    // Initial fetch
    const loadOrder = async () => {
      const data = await fetchOrderById(orderId, sessionId);
      if (data) {
        setOrder(data);
        setError(false);
      } else {
        setError(true);
      }
    };

    loadOrder();
    fetchOrderItems(orderId, sessionId).then(setOrderItems);

    // Poll for status updates
    pollRef.current = setInterval(async () => {
      const updated = await fetchOrderById(orderId, sessionId);
      if (updated) setOrder(updated);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params?.orderId, sessionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <AlertCircle className="w-12 h-12 text-primary mb-4" />
          <p className="text-muted-foreground text-lg mb-4 font-sans">Order not found</p>
          <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-sans">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center h-[60vh] px-4">
          <p className="text-muted-foreground text-lg">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <Header />

      <div className="bg-primary text-primary-foreground px-4 py-8 text-center shadow-md">
        <div className="container">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold font-sans mb-2 text-secondary">Order Confirmed!</h1>
          <p className="text-primary-foreground/80 text-lg font-sans">
            Your order has been placed successfully
          </p>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8 space-y-8 relative z-10">
        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 text-center shadow-md">
          <p className="text-muted-foreground text-sm font-bold mb-4 uppercase tracking-widest font-sans">
            Your Queue Number
          </p>
          <div className="mb-4">
            <p className="text-7xl md:text-8xl font-black text-primary tracking-widest font-sans">
              {order.queueNumber}
            </p>
          </div>
          <div className="h-1 w-3/4 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full mb-6" />
          <p className="text-foreground font-bold text-lg font-sans">
            Please save or remember this number
          </p>
          <p className="text-muted-foreground text-sm mt-2 font-sans">
            Show this to staff when your order is called
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              {order.orderType === "Dine-In" ? (
                <Utensils className="w-5 h-5 text-primary" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-bold mb-1 font-sans">Order Type</p>
            <p className="text-lg font-bold text-foreground font-sans">{order.orderType}</p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-bold mb-1 font-sans">Time Ordered</p>
            <p className="text-lg font-bold text-foreground font-sans">
              {new Date(order.orderTimestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-bold mb-1 font-sans">Items</p>
            <p className="text-lg font-bold text-foreground font-sans">
              {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-primary/20 shadow-sm flex flex-col items-center justify-center text-center bg-primary/5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="font-bold text-primary font-sans text-lg">₱</span>
            </div>
            <p className="text-xs text-primary font-bold mb-1 font-sans">Total Cost</p>
            <p className="text-lg font-bold text-primary font-sans">
              ₱{orderItems.reduce((sum, i) => sum + (i.price + i.selectedAddons.reduce((s, a) => s + a.price, 0)) * i.quantity, 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-bold text-foreground mb-2 font-sans">What's Next?</p>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            We're starting on your order right now. Just listen for your number
            to be called, then head over to the counter and we'll take care of
            the rest.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => setLocation("/my-orders")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-lg text-lg shadow-md flex items-center justify-center gap-2 font-sans"
          >
            Track Order Progress
          </Button>

          <Button
            onClick={() => setLocation(`/receipt/${order.orderID}`)}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 rounded-lg text-lg shadow-md flex items-center justify-center gap-2 font-sans"
          >
            View Full Receipt
          </Button>

          <Button
            onClick={() => setLocation("/menu")}
            variant="outline"
            className="w-full py-6 text-primary border-primary hover:bg-primary/10 font-bold text-lg rounded-lg font-sans flex items-center justify-center gap-2"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
