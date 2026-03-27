import { useEffect, useState, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { fetchOrderById, fetchOrderItems } from "@/lib/orderService";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DbOrder, DbOrderItem } from "@/types/database";
import { CheckCircle, Clock, Home, AlertCircle } from "lucide-react";
import Header from "@/components/Header";

export default function Receipt() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/receipt/:orderId");
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!match || !params?.orderId) return;
    const orderId = parseInt(params.orderId);

    fetchOrderById(orderId).then((data) => { if (data) setOrder(data); });
    fetchOrderItems(orderId).then(async (items) => {
      setOrderItems(items);
      if (items.length > 0) {
        const productIds = items.map(i => i.productID);
        const { data } = await supabase
          .from('products')
          .select('"productID", "productName"')
          .in('"productID"', productIds)
          .eq('is_current', true);
        if (data) {
          const map: Record<number, string> = {};
          data.forEach((p: { productID: number; productName: string }) => { map[p.productID] = p.productName; });
          setProductNames(map);
        }
      }
    });
  }, [match, params?.orderId]);

  const subtotal = useMemo(() =>
    orderItems.reduce((sum, i) => sum + (i.price + i.selectedAddons.reduce((s, a) => s + a.price, 0)) * i.quantity, 0),
    [orderItems]
  );

  const discountRate = order?.discountType === 'PWD' || order?.discountType === 'Senior' ? 0.2 : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

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

  const statusConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string; label: string }> = {
    Pending: {
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      label: "Pending",
    },
    Completed: {
      icon: CheckCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      label: "Order Completed",
    },
  };

  const config = statusConfig[order.status] ?? statusConfig["Pending"];
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
                Status: {order.status}
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
              <span className="font-bold">{order.orderType}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono text-sm font-bold">{order.orderID}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Placed at:</span>
              <span className="font-bold">
                {new Date(order.orderTimestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4 bg-card shadow-sm border-none">
          <h2 className="text-lg font-bold text-primary font-sans mb-4">Order Items</h2>
          <div className="space-y-3 font-sans">
            {orderItems.map((item) => (
              <div key={item.orderItemID} className="flex justify-between pb-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-bold text-foreground">
                    {productNames[item.productID] ?? `Product #${item.productID}`} x{item.quantity}
                  </p>
                  {item.selectedAddons.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Add-ons: {item.selectedAddons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <p className="font-bold text-foreground">
                  ₱
                  {(
                    (item.price + item.selectedAddons.reduce((sum, a) => sum + a.price, 0)) *
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
              <span className="font-bold text-foreground">₱{subtotal.toFixed(2)}</span>
            </div>

            {order.discountType !== "None" && (
              <div className="flex justify-between text-green-700">
                <span>
                  {order.discountType} Discount (20%):
                </span>
                <span className="font-bold">-₱{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 flex justify-between text-xl font-bold text-primary font-sans">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
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