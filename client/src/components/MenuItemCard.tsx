import { MenuItem } from "@/lib/menuData";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  onAddToCart,
  onViewDetails,
}: MenuItemCardProps) {
  return (
    <div 
      // h-full and flex-col ensure all cards stretch to the same height in the grid
      className="h-full flex flex-col bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer font-sans" 
      onClick={() => onViewDetails(item)}
    >
      {/* Image Container - Responsive height so it looks good on small mobile screens */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 shrink-0 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {item.isBestSeller && (
          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold font-sans shadow-sm">
            Best Seller
          </div>
        )}
      </div>

      {/* Content Container - flex-1 allows this to fill the remaining card height */}
      <div className="flex-1 flex flex-col p-3 sm:p-4">
        
        {/* Item Name - Scaled down slightly for mobile */}
        <h3 className="font-bold text-sm sm:text-base md:text-lg text-foreground mb-1 line-clamp-2 font-sans">
          {item.name}
        </h3>
        
        {/* Description - Scaled for mobile */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 font-sans">
          {item.description}
        </p>

        {/* Price and Add Button - mt-auto is the magic that pushes this to the very bottom! */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-muted/50">
          <span className="text-base sm:text-xl md:text-2xl font-bold text-primary font-sans">
            ₱{item.price.toFixed(2)}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            // Added flex, items-center, justify-center, and aspect-square for perfect centering
            className="flex items-center justify-center aspect-square bg-secondary text-secondary-foreground p-1.5 sm:p-2 rounded-full hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}