import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useGuestSession } from "@/contexts/GuestSessionContext";
import { placeOrder } from "@/lib/orderService";
import { ChevronLeft, Utensils, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";

type DiscountType = "none" | "pwd" | "senior";

const DISCOUNT_RATES: Record<DiscountType, number> = {
  none: 0,
  pwd: 0.2,
  senior: 0.2,
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, orderType, setOrderType, clearCart } = useCart();
  const { sessionId } = useGuestSession();
  
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [isPlacing, setIsPlacing] = useState(false);
  const [isEditingOrderType, setIsEditingOrderType] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const addOnsPrice = (item.selectedAddons || []).reduce((acc, addOn) => acc + (addOn.price || 0), 0);
      return sum + (item.price + addOnsPrice) * item.quantity;
    }, 0);
  }, [items]);

  const discountPercentage = DISCOUNT_RATES[discountType];
  const discountAmount = subtotal * discountPercentage;
  const total = subtotal - discountAmount;

  useEffect(() => {
    if (!orderType) {
      setLocation("/order-type");
    }
  }, [orderType, setLocation]);

  if (!orderType) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <Header />
        <div className="bg-primary text-primary-foreground px-4 py-6 shadow-md">
          <div className="container flex items-center gap-4">
            <button onClick={() => setLocation("/menu")} className="p-2 hover:bg-primary/80 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold font-sans">Checkout</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
            <Button onClick={() => setLocation("/menu")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 px-8 rounded-lg">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setOrderError(null);
    try {
      const dbOrderType = orderType === "dine-in" ? "Dine-In" : "Take-Out";
      const dbDiscountType = discountType === "pwd" ? "PWD" : discountType === "senior" ? "Senior" : "None";

      // NOTE: cart must be cleared if item IDs change (e.g. after fallback→DB ID migration)
      // Items with non-numeric IDs (Kampukan, Canned Soda, Mountain Dew) are skipped
      const validItems = items
        .map((item) => ({
          productId: parseInt(item.itemId, 10),
          quantity: item.quantity,
          price: item.price,
          selectedAddons: item.selectedAddons ?? [],
        }))
        .filter((item) => !isNaN(item.productId));

      if (validItems.length === 0) {
        setOrderError("No valid items to order. Please refresh the menu and try again.");
        return;
      }

      const result = await placeOrder({
        sessionId,
        orderType: dbOrderType,
        discountType: dbDiscountType,
        items: validItems,
      });

      clearCart();
      setLocation(`/queue-confirmation/${result.orderID}`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 bg-primary text-primary-foreground px-4 py-6 shadow-md">
        <div className="container flex items-center gap-4">
          <button onClick={() => setLocation("/menu")} className="p-2 hover:bg-primary/80 rounded-lg transition-all duration-200 hover:scale-110">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-sans">Checkout</h1>
            <p className="text-primary-foreground/80 text-sm">Review your order</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">
        
        <Card className="p-4 shadow-md bg-card border-none">
           <h2 className="text-lg font-bold text-primary font-sans mb-4">Dining Option</h2>
           {!isEditingOrderType ? (
             <div className="flex flex-col items-center justify-center py-5 px-4 bg-muted/30 rounded-xl border border-border/50">
               <div className="text-2xl font-bold text-foreground flex items-center gap-3">
                 {orderType === "dine-in" ? <><Utensils className="text-primary" size={28} /> Dine-In</> : <><ShoppingBag className="text-primary" size={28} /> Take-Out</>}
               </div>
               <button onClick={() => setIsEditingOrderType(true)} className="mt-3 text-sm text-primary/80 hover:text-primary underline underline-offset-4 transition-colors font-medium">
                 Change order type
               </button>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => { setOrderType("dine-in"); setIsEditingOrderType(false); }} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 ${orderType === "dine-in" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border"}`}>
                  <Utensils size={20} /> Dine-In
                </button>
                <button onClick={() => { setOrderType("take-out"); setIsEditingOrderType(false); }} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 ${orderType === "take-out" ? "border-primary bg-primary/10 text-primary font-bold" : "border-border"}`}>
                  <ShoppingBag size={20} /> Take-Out
                </button>
             </div>
           )}

           <h2 className="text-lg font-bold text-primary font-sans mt-6 mb-4">Apply Discount</h2>
           <div className="space-y-3">
             <DiscountOption value="none" label="No Discount" selected={discountType === "none"} onChange={() => setDiscountType("none")} />
             <DiscountOption value="pwd" label="PWD Discount (20%)" selected={discountType === "pwd"} onChange={() => setDiscountType("pwd")} />
             <DiscountOption value="senior" label="Senior Citizen Discount (20%)" selected={discountType === "senior"} onChange={() => setDiscountType("senior")} />
           </div>
        </Card>

        
        <Card className="p-6 shadow-md bg-card border-none">
          <h2 className="text-lg font-bold text-primary font-sans mb-4">Order Summary</h2>
          <div className="space-y-4 mb-4">
            {items.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start">
                <div>
                  <span className="text-base font-semibold text-foreground">
                    {item.quantity}x {item.itemName}
                  </span>
                  {(item.selectedAddons || []).length > 0 && (
                    <p className="text-sm text-muted-foreground font-normal">{item.selectedAddons!.map(a => a.name).join(', ')}</p>
                  )}
                </div>
                <span className="text-base font-semibold text-foreground">
                  ₱{((item.price + (item.selectedAddons || []).reduce((sum, a) => sum + a.price, 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            {discountType !== "none" && (
              <div className="flex justify-between text-green-700 font-medium">
                <span>Discount (20%):</span>
                <span>-₱{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-primary pt-2">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-3 pt-4">
          {orderError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-700 text-sm font-sans font-medium">{orderError}</p>
            </div>
          )}
          <Button onClick={handlePlaceOrder} disabled={isPlacing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-lg text-lg shadow-md transition-transform hover:-translate-y-1">
            {isPlacing ? "Processing..." : "Place Order"}
          </Button>
          <Button onClick={() => setLocation("/menu")} variant="outline" className="w-full py-6 text-primary border-primary hover:bg-primary/10 font-bold text-lg rounded-lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

function DiscountOption({ value, label, selected, onChange }: { value: DiscountType; label: string; selected: boolean; onChange: () => void; }) {
  return (
    <button onClick={onChange} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
        {selected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
      </div>
      <span className="text-foreground font-medium">{label}</span>
    </button>
  );
}