import { MenuItem, AddOn, Variant } from "@/lib/menuData";
import { X, Plus, Minus } from "lucide-react";
import { useState } from "react";

// In ItemDetailsModal.tsx, update the interface:

interface ItemDetailsModalProps {
  item: MenuItem & { 
    editingCartId?: string;
    currentQuantity?: number;
    currentVariant?: { id: string; name: string };
    currentAddOns?: AddOn[];
  };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem, 
    quantity: number, 
    addOns: AddOn[], 
    variant?: Variant,
    isEditing?: boolean,
    editingCartId?: string
  ) => void;
}

export default function ItemDetailsModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: ItemDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();

  if (!isOpen) return null;

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.id === addOn.id)
        ? prev.filter((a) => a.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = (item.price + addOnsTotal) * quantity;

  // In ItemDetailsModal, when adding to cart:
  // In ItemDetailsModal.tsx, find the handleAddToCart function and update it:

  const handleAddToCart = () => {
    // We use the 'item' prop passed to the component, not 'selectedItem'
    const isEditing = !!item.editingCartId;
    
    onAddToCart(
      item, 
      quantity, 
      selectedAddOns, 
      selectedVariant,
      isEditing,
      item.editingCartId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="relative bg-card text-card-foreground rounded-2xl shadow-2xl animate-in zoom-in-95 w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-secondary text-secondary-foreground p-2 rounded-full hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Image */}
        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.currentTarget.src = '/other_images/tatuns_logo.png'; }}
          />
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Title and Price */}
          <div className="mb-3">
            {/* Added font-sans right here */}
            <h2 className="text-2xl font-bold font-sans text-foreground mb-1">
              {item.name}
            </h2>
            <p className="text-lg text-primary font-bold">₱{item.price}</p>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
            {item.description}
          </p>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">
                Choose Variant
              </label>
              <div className="space-y-2">
                {item.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left ${
                      selectedVariant?.id === variant.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedVariant?.id === variant.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="flex-1 font-medium">{variant.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2">Quantity</label>
            <div className="flex items-center gap-3 bg-muted p-2 rounded-lg w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">Add-ons</label>
              <div className="space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex items-center gap-3 p-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddOns.some((a) => a.id === addOn.id)}
                      onChange={() => toggleAddOn(addOn)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <span className="flex-1 font-medium text-sm">{addOn.name}</span>
                    <span className="text-primary font-bold text-sm">₱{addOn.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Total and Action Buttons */}
          <div className="border-t border-border pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold font-sans">Total:</span>
              <span className="text-xl font-bold text-primary font-sans">₱{totalPrice}</span>
            </div>
            
            {/* Buttons side-by-side using Flexbox */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-lg font-semibold hover:opacity-80 transition-colors text-sm font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                disabled={item.variants && item.variants.length > 0 && !selectedVariant}
                className="flex-[2] bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-sans"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}