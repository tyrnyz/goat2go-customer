import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { UtensilsCrossed, ShoppingBag } from "lucide-react";

export default function OrderType() {
  const [, setLocation] = useLocation();
  const { setOrderType } = useCart();

  const handleDineIn = () => {
    setOrderType("dine-in");
    setLocation("/menu");
  };

  const handleTakeOut = () => {
    setOrderType("take-out");
    setLocation("/menu");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar stays at the top */}
      <Header />

      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Updated Title Section */}
          <div className="mb-8 text-center animate-fade-in">
            {/* Added font-sans here to guarantee it matches the buttons */}
            <h1 className="text-3xl font-bold font-sans text-foreground">
              Choose how you'd like to enjoy your meal
            </h1>
          </div>

          {/* Floating Modal Card */}
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <div className="space-y-4">
              {/* Dine-In Option */}
              <button
                onClick={handleDineIn}
                className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 hover:shadow-lg"
              >
                <div className="bg-white/20 p-3 rounded-full">
                  <UtensilsCrossed className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Dine-In</div>
                  <div className="text-sm text-primary-foreground/80">
                    Enjoy at our restaurant
                  </div>
                </div>
              </button>

              {/* Takeout Option */}
              <button
                onClick={handleTakeOut}
                className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-secondary text-secondary-foreground rounded-xl hover:opacity-90 transition-all duration-200 hover:shadow-lg"
              >
                <div className="bg-white/20 p-3 rounded-full">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Take-Out</div>
                  <div className="text-sm text-secondary-foreground/80">Pack and go</div>
                </div>
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setLocation("/")}
                className="w-full py-3 text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}