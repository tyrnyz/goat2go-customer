import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useOrders } from "@/contexts/OrdersContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/types";
import { CheckCircle, Clock, Home, AlertCircle } from "lucide-react";
import Header from "@/components/Header";

export default function Receipt() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/receipt/:orderId");
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);

  // Get order from context using the orderId from params
  useEffect(() => {
    if (match && params?.orderId) {
      const foundOrder = getOrderById(params.orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [match, params?.orderId, getOrderById]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 pb-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-4 font-sans">Order not found</p>
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-sans">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Keeping the semantic colors for the status indicators as they are standard UX for order tracking
  const statusConfig = {
    preparing: {
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50/50",
      label: "Preparing Your Order",
    },
    ready: {
      icon: CheckCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
      label: "Ready for Pickup",
    },
    completed: {
      icon: CheckCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      label: "Order Completed",
    },
    pending: {
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      label: "Pending",
    },
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      {/* Global Navbar */}
      <Header />

      {/* Success Banner */}
      <div className="bg-primary text-primary-foreground px-4 py-8 shadow-md relative overflow-hidden">
        {/* Subtle background pulse matching checkout */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="text-center relative z-10">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[#f4c27a]" />
          <h1 className="text-3xl font-bold mb-2 font-sans text-[#f4c27a]">Order Confirmed!</h1>
          <p className="text-primary-foreground/90 font-sans">Your order has been placed successfully</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Queue Number - Main Focus */}
        <Card className="p-8 bg-card border-2 border-primary/20 shadow-lg text-center">
          <p className="text-muted-foreground text-sm mb-2 uppercase tracking-wider font-bold font-sans">Your Queue Number</p>
          <p className="text-6xl font-bold text-primary tracking-widest font-sans">
            {order.queueNumber}
          </p>
          <p className="text-muted-foreground text-sm mt-4 font-sans">
            Please take note of your queue number
          </p>
        </Card>

        {/* Order Status */}
        <Card className={`p-4 border-none shadow-sm ${config.bgColor}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${config.color}`} />
            <div>
              <p className={`font-bold font-sans ${config.color}`}>{config.label}</p>
              <p className="text-sm text-muted-foreground font-sans">
                Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-4 bg-card shadow-sm border-none">
          <h2 className="text-lg font-bold text-primary font-sans mb-4">Order Details</h2>
          <div className="space-y-3 text-foreground font-sans">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Order Type:</span>
              <span className="font-bold">
                {order.orderType === "dine-in" ? "Dine-In" : "Take-Out"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono text-sm font-bold">{order.orderId}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Placed at:</span>
              <span className="font-bold">
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4 bg-card shadow-sm border-none">
          <h2 className="text-lg font-bold text-primary font-sans mb-4">Order Items</h2>
          <div className="space-y-3 font-sans">
            {order.items.map((item) => (
              <div key={item.itemId} className="flex justify-between pb-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-bold text-foreground">
                    {item.itemName} {item.selectedVariant && `(${item.selectedVariant.name})`} x{item.quantity}
                  </p>
                  {item.selectedVariant && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ✓ Variant: {item.selectedVariant.name}
                    </p>
                  )}
                  {item.addOns.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Add-ons: {item.addOns.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <p className="font-bold text-foreground">
                  ₱
                  {(
                    (item.price + item.addOns.reduce((sum, a) => sum + a.price, 0)) *
                    item.quantity
                  ).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Pricing Summary */}
        <Card className="p-4 bg-muted/30 shadow-sm border-none">
          <div className="space-y-3 font-sans">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-bold text-foreground">₱{order.subtotal.toFixed(2)}</span>
            </div>

            {order.discount.type !== "none" && (
              <div className="flex justify-between text-green-700">
                <span>
                  {order.discount.type === "pwd" ? "PWD" : "Senior"} Discount
                  (20%):
                </span>
                <span className="font-bold">-₱{order.discount.amount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 flex justify-between text-xl font-bold text-primary font-sans">
              <span>Total:</span>
              <span>₱{order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={() => setLocation("/my-orders")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-sans text-lg py-6 rounded-lg shadow-md transition-transform hover:-translate-y-1"
          >
            Track Order
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full py-6 text-primary border-primary hover:bg-primary/10 font-bold font-sans text-lg flex items-center justify-center"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}