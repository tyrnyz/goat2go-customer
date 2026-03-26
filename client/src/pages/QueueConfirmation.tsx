import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { fetchOrderById, fetchOrderItems, subscribeToOrder } from "@/lib/orderService";
import type { DbOrder, DbOrderItem } from "@/types/database";
import {
  CheckCircle,
  ShoppingBag,
  Utensils,
  Clock,
  Package,
} from "lucide-react";
import Header from "@/components/Header";

export default function QueueConfirmation() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/queue-confirmation/:orderId");
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);

  useEffect(() => {
    const orderId = params?.orderId ? parseInt(params.orderId) : null;
    if (!orderId) return;

    fetchOrderById(orderId).then((data) => {
      if (data) setOrder(data);
    });

    fetchOrderItems(orderId).then(setOrderItems);

    const channel = subscribeToOrder(orderId, (updated) => {
      setOrder(updated);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [params?.orderId]);

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

      {/* Sub Header / Success Banner */}
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
        
        {/* Queue Number - MAIN FOCUS */}
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

        {/* Quick Info Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Order Type */}
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              {order.orderType === "Dine-In" ? (
                <Utensils className="w-5 h-5 text-primary" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-bold mb-1 font-sans">Order Type</p>
            <p className="text-lg font-bold text-foreground font-sans">
              {order.orderType}
            </p>
          </div>

          {/* Time */}
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

          {/* Items Count */}
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-bold mb-1 font-sans">Items</p>
            <p className="text-lg font-bold text-foreground font-sans">
              {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Total Cost */}
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

        {/* Next Steps */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-bold text-foreground mb-2 font-sans">
            What's Next?
          </p>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            We're starting on your order right now. Just listen for your number 
            to be called, then head over to the counter and we'll take care of 
            the rest.
          </p>
        </div>

        {/* Action Buttons */}
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