import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useLocation } from "wouter";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [, setLocation] = useLocation();
  
  const subtotal = items.reduce((sum, item) => {
    const addOnsPrice = (item.selectedAddons || []).reduce((a, b) => a + (b.price || 0), 0);
    return sum + (item.price + addOnsPrice) * item.quantity;
  }, 0);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-[110] backdrop-blur-sm" onClick={onClose} />}
      
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-card shadow-2xl z-[120] transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full font-sans">
          {/* Header */}
          <div className="p-5 border-b flex justify-between items-center bg-[#6a1b1a] text-[#f4c27a]">
            <h2 className="text-lg font-bold font-sans">My Cart</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          
          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                <ShoppingBag size={48} className="mb-2" />
                <p className="font-sans">Your cart is empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cartId} className="flex gap-4 border-b pb-4 items-center">
                  <div className="flex-1 font-sans">
                    <h3 className="font-bold text-base font-sans">{item.itemName}</h3>
                    {(item.selectedAddons || []).length > 0 && (
                      <p className="text-xs text-muted-foreground">{item.selectedAddons!.map(a => a.name).join(', ')}</p>
                    )}
                    <p className="text-sm text-muted-foreground">₱{((item.price + (item.selectedAddons || []).reduce((sum, a) => sum + a.price, 0)) * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)} 
                      className="p-2 hover:bg-background rounded-md transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-6 text-center text-base font-sans">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                      className="p-2 hover:bg-background rounded-md transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.cartId)} 
                      className="text-red-500 p-2 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between text-lg font-bold mb-4 font-sans">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setLocation("/checkout")}
                className="w-full py-3 font-bold rounded-lg hover:brightness-105 font-sans"
                style={{ backgroundColor: "#f4c27a", color: "#6a1b1a" }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}