import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Home, UtensilsCrossed, ClipboardList, Phone, ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// Added this prop so the Menu page can trigger the CartSidebar!
interface HeaderProps {
  onCartClick?: () => void;
}

export default function Header({ onCartClick }: HeaderProps = {}) {
  const [location, navigate] = useLocation();
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/menu", label: "Menu", icon: UtensilsCrossed },
    { path: "/my-orders", label: "My Orders", icon: ClipboardList },
    { path: "/contact", label: "Contact Us", icon: Phone },
  ];

  // Close drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="shadow-md relative z-40" style={{ backgroundColor: "#6a1b1a" }}>
        <div className="container py-3 md:py-4 px-3 md:px-4 flex items-center justify-between gap-2">

          {/* Logo and Name */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <img
              src="/other_images/tatuns_logo.png"
              alt="Tatuns Kambingan Logo"
              className="h-8 sm:h-10 md:h-16 lg:h-20 w-auto object-contain"
            />
            <div className="flex flex-col justify-center">
              <h1
                className="text-[11px] sm:text-xs md:text-xl lg:text-3xl font-bold leading-tight whitespace-nowrap"
                style={{ color: "#f4c27a", letterSpacing: "0.5px" }}
              >
                Tatuns Kambingan
              </h1>
              <p className="text-[8px] sm:text-[9px] md:text-xs whitespace-nowrap" style={{ color: "#f4c27a", opacity: 0.9 }}>
                Authentic Filipino Restaurant
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 transition-all duration-200 border-b-2 hover:border-[#f4c27a] ${
                    isActive ? "border-[#f4c27a]" : "border-transparent"
                  }`}
                  style={{ color: "#f4c27a" }}
                >
                  <Icon size={18} />
                  <span className="font-semibold text-sm xl:text-base">{label}</span>
                </button>
              );
            })}

            {/* Global Cart Icon (Desktop) */}
            <button
              onClick={() => onCartClick ? onCartClick() : navigate("/menu")}
              className="relative p-2 rounded-lg transition-transform hover:scale-105 ml-2"
              style={{ color: "#f4c27a" }}
              aria-label="View Cart"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center translate-x-1/4 -translate-y-1/4 border-2 border-[#6a1b1a]">
                  {items.length}
                </span>
              )}
            </button>

            {/* Solid Order Now Button (Desktop) */}
            <button
              onClick={() => navigate("/order-type")}
              className="flex items-center justify-center gap-2 px-4 xl:px-6 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ml-4 text-sm xl:text-base shadow-md"
              style={{ backgroundColor: "#f4c27a", color: "#6a1b1a" }}
            >
              Order Now
            </button>
          </nav>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Global Cart Icon (Mobile) */}
            <button
              onClick={() => onCartClick ? onCartClick() : navigate("/menu")}
              className="relative p-2 rounded-lg transition-transform hover:scale-105"
              style={{ color: "#f4c27a" }}
              aria-label="View Cart"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center translate-x-1/4 -translate-y-1/4 border border-[#6a1b1a]">
                  {items.length}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg transition-transform hover:scale-105"
              style={{ color: "#f4c27a" }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-0 left-0 right-0 z-30 lg:hidden transition-transform duration-300 ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"}`}
        style={{ backgroundColor: "#6a1b1a", paddingTop: "72px" }}
      >
        <nav className="flex flex-col px-4 pb-6 pt-2 gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base text-left transition-colors ${
                  isActive ? "bg-white/10" : "hover:bg-white/10"
                }`}
                style={{ color: "#f4c27a" }}
              >
                <Icon size={20} />
                {label}
              </button>
            );
          })}
          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => navigate("/order-type")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-base shadow-md transition-all hover:brightness-110"
              style={{ backgroundColor: "#f4c27a", color: "#6a1b1a" }}
            >
              Order Now
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
