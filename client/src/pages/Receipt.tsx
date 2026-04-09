import { useEffect, useState, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { fetchOrderById, fetchOrderItems, cancelCustomerOrder } from "@/lib/orderService";
import { supabase } from "@/lib/supabase";
import { useGuestSession } from "@/contexts/GuestSessionContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DbOrder, DbOrderItem } from "@/types/database";
import { CheckCircle, Home, AlertCircle, XCircle } from "lucide-react";
import { getReceiptStatusConfig } from "@/lib/orderStatus";
import Header from "@/components/Header";

export default function Receipt() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/receipt/:orderId");
  const { sessionId } = useGuestSession();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  type LoadState = 'loading' | 'network-error' | 'not-found' | 'loaded';
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [itemsFetchFailed, setItemsFetchFailed] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params?.orderId || !sessionId) return;
    const orderId = parseInt(params.orderId, 10);

    const load = async () => {
      try {
        const data = await fetchOrderById(orderId, sessionId);
        if (data) {
          setOrder(data);
          setLoadState('loaded');
        } else {
          setLoadState('not-found');
        }
      } catch {
        setLoadState('network-error');
      }

      try {
        const items = await fetchOrderItems(orderId, sessionId);
        setOrderItems(items);
        if (items.length > 0) {
          const productSids = items.map(i => i.product_sid).filter(Boolean);
          const { data } = await supabase
            .from('products')
            .select('product_sid, productName')
            .in('product_sid', productSids);
          if (data) {
            const map: Record<number, string> = {};
            data.forEach((p: { product_sid: number; productName: string }) => { map[p.product_sid] = p.productName; });
            setProductNames(map);
          }
        }
      } catch {
        setItemsFetchFailed(true);
      }
    };

    load();
  }, [match, params?.orderId, sessionId]);

  const subtotal = useMemo(() =>
    orderItems.reduce((sum, i) => sum + (i.price + i.selectedAddons.reduce((s, a) => s + a.price, 0)) * i.quantity, 0),
    [orderItems]
  );

  const handleCancel = async () => {
    if (!sessionId || !order) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancelCustomerOrder(order.orderID, sessionId);
      const updated = await fetchOrderById(order.orderID, sessionId);
      if (updated) setOrder(updated);
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order');
      // Refresh so the badge reflects what the server actually thinks
      const refreshed = await fetchOrderById(order.orderID, sessionId);
      if (refreshed) setOrder(refreshed);
    } finally {
      setIsCancelling(false);
    }
  };

  const discountRate = order?.discountType === 'PWD' || order?.discountType === 'Senior' ? 0.2 : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 pb-20">
          <p className="text-muted-foreground font-sans">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (loadState === 'network-error') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 pb-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-foreground font-bold mb-2 font-sans">Could not load your receipt</p>
            <p className="text-muted-foreground mb-4 font-sans text-sm">Please try again.</p>
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-sans">
              Reload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loadState === 'not-found' || !order) {
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

  const config = getReceiptStatusConfig(order.status);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      {/* Global Navbar */}
      <Header />

      {/* Banner */}
      {order.status === 'Cancelled' ? (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-8 shadow-sm">
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h1 className="text-3xl font-bold mb-2 font-sans text-gray-600">Order Cancelled</h1>
            <p className="text-gray-500 font-sans">This order was not processed</p>
          </div>
        </div>
      ) : (
        <div className="bg-primary text-primary-foreground px-4 py-8 shadow-md relative overflow-hidden">
          {/* Subtle background pulse matching checkout */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
          <div className="text-center relative z-10">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[#f4c27a]" />
            <h1 className="text-3xl font-bold mb-2 font-sans text-[#f4c27a]">Order Confirmed!</h1>
            <p className="text-primary-foreground/90 font-sans">Your order has been placed successfully</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Queue Number - Main Focus */}
        <Card className={`p-8 bg-card shadow-lg text-center ${order.status === 'Cancelled' ? 'border-2 border-gray-200' : 'border-2 border-primary/20'}`}>
          <p className="text-muted-foreground text-sm mb-2 uppercase tracking-wider font-bold font-sans">Your Queue Number</p>
          <p className={`text-6xl font-bold tracking-widest font-sans ${order.status === 'Cancelled' ? 'text-gray-400 opacity-50 line-through' : 'text-primary'}`}>
            {order.queueNumber}
          </p>
          <p className="text-muted-foreground text-sm mt-4 font-sans">
            {order.status === 'Cancelled' ? 'This order was cancelled' : 'Please take note of your queue number'}
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
                {new Date(order.orderTimestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                {' · '}
                {new Date(order.orderTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4 bg-card shadow-sm border-none">
          <h2 className="text-lg font-bold text-primary font-sans mb-4">Order Items</h2>
          {itemsFetchFailed ? (
            <p className="text-sm text-muted-foreground font-sans">Could not load order items. Please reload.</p>
          ) : (
          <div className="space-y-3 font-sans">
            {orderItems.map((item) => (
              <div key={item.orderItemID} className="flex justify-between pb-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-bold text-foreground">
                    {productNames[item.product_sid ?? -1] ?? `Product #${item.productID}`} x{item.quantity}
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
          )}
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
          {order.status === 'Pending' && (
            <>
              <hr className="border-border/50" />
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="w-full py-6 text-gray-500 border-gray-300 hover:bg-gray-50 font-bold font-sans text-lg flex items-center justify-center"
              >
                Cancel This Order
              </Button>
            </>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold font-sans mb-2">Cancel this order?</h3>
            <p className="text-muted-foreground text-sm font-sans mb-4">
              This can't be undone. The order will be marked as cancelled.
            </p>
            {cancelError && (
              <p className="text-red-600 text-sm font-sans mb-3">{cancelError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowCancelModal(false); setCancelError(null); }}
                disabled={isCancelling}
              >
                Keep Order
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}