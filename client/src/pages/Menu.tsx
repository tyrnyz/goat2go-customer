import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import MenuItemCard from "@/components/MenuItemCard";
import ItemDetailsModal from "@/components/ItemDetailsModal";
import CartSidebar from "@/components/CartSidebar";
import { useCart } from "@/contexts/CartContext";
import {
  MenuItem,
  AddOn,
  Variant,
  categories,
  fallbackMenuItems,
  loadMenuFromSupabase,
} from "@/lib/menuData";

export default function Menu() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("best-sellers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem & {
    editingCartId?: string;
    currentQuantity?: number;
    currentVariant?: { id: string; name: string };
    currentAddOns?: AddOn[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart, orderType, setOrderType, updateItem } = useCart();
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMenuFromSupabase()
      .then((items) => setMenuItems(items))
      .catch((err) => {
        console.error("Failed to load menu from Supabase, using fallback:", err);
        setMenuItems(fallbackMenuItems);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) return;
    
    // Observer tuning: -20% top / -30% bottom captures sections even if they are short
    const observerOptions = { root: null, rootMargin: "-20% 0px -30% 0px", threshold: 0 };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSelectedCategory(entry.target.id);
          
          // Auto-scroll horizontal tabs
          const activeTab = document.getElementById(`tab-${entry.target.id}`);
          if (activeTab && tabContainerRef.current) {
            const container = tabContainerRef.current;
            const scrollLeft = activeTab.offsetLeft - (container.clientWidth / 2) + (activeTab.clientWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    Object.values(sectionRefs.current).forEach((section) => { if (section) observer.observe(section); });
    
    return () => { observer.disconnect(); };
  }, [searchQuery]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = window.innerWidth >= 768 ? 180 : 150; 
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  const handleAddToCart = (item: MenuItem, quantity: number, addOns: AddOn[], variant?: Variant, isEditing?: boolean, editingCartId?: string) => {
    const cartItem = {
      itemId: item.id,
      itemName: item.name,
      quantity,
      price: item.price,
      addOns,
      selectedVariant: variant ? { id: variant.id, name: variant.name } : undefined,
    };
    isEditing && editingCartId ? updateItem(editingCartId, cartItem) : addToCart(cartItem);
    setIsModalOpen(false);
  };

  const getItemsByCategory = (categoryId: string): MenuItem[] => {
    if (categoryId === "best-sellers") {
      return menuItems.filter((item) => item.isBestSeller);
    }
    return menuItems.filter((item) => item.category === categoryId);
  };

  const searchItems = (query: string): MenuItem[] => {
    const lowerQuery = query.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="sticky top-0 z-50 bg-background shadow-sm border-b">
        <Header onCartClick={() => setIsCartOpen(true)} />
        
        <div className="container px-3 sm:px-4 pt-3 pb-3">
          <div className="relative w-full max-w-4xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 py-3 rounded-xl bg-white border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-base font-sans"
            />
          </div>
        </div>

        {searchQuery.length === 0 && (
          <div className="overflow-x-auto no-scrollbar pb-3" ref={tabContainerRef}>
            <div className="flex gap-2 px-3 justify-start sm:justify-center w-max sm:w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`tab-${cat.id}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex-shrink-0 px-6 py-2 text-sm font-semibold rounded-full transition font-sans ${
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <main className="container px-3 sm:px-4 py-8 pb-32">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse h-48" />
            ))}
          </div>
        ) : searchQuery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {searchItems(searchQuery).map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={() => { setSelectedItem(item); setIsModalOpen(true); }} onViewDetails={() => { setSelectedItem(item); setIsModalOpen(true); }} />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const items = getItemsByCategory(cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} id={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el; }} className="mb-12 scroll-mt-40">
                <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2 font-sans">{cat.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} onAddToCart={() => { setSelectedItem(item); setIsModalOpen(true); }} onViewDetails={() => { setSelectedItem(item); setIsModalOpen(true); }} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      

      {selectedItem && <ItemDetailsModal item={selectedItem} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedItem(null); }} onAddToCart={handleAddToCart} />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onEdit={(cartItem) => {
        const itemData = menuItems.find((item) => item.id === cartItem.itemId);
        if (itemData) {
          setSelectedItem({ ...itemData, editingCartId: cartItem.cartId, currentQuantity: cartItem.quantity, currentVariant: cartItem.selectedVariant, currentAddOns: cartItem.addOns });
          setIsModalOpen(true); setIsCartOpen(false);
        }
      }} />

      {!orderType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card p-6 rounded-2xl w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 font-sans">How would you like to order?</h2>
            <div className="flex gap-2">
              <button onClick={() => setOrderType("dine-in")} className="flex-1 py-3 bg-primary text-white rounded-lg font-sans">Dine-In</button>
              <button onClick={() => setOrderType("take-out")} className="flex-1 py-3 bg-secondary text-white rounded-lg font-sans">Take-Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}