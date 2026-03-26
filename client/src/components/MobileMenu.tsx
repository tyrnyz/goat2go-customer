import { useState } from "react";
import { useLocation } from "wouter";
import { Home, UtensilsCrossed, ClipboardList, Phone, ShoppingCart, Menu, X } from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/menu", label: "Menu", icon: UtensilsCrossed },
    { path: "/my-orders", label: "My Orders", icon: ClipboardList },
    { path: "/contact", label: "Contact Us", icon: Phone },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg transition-transform hover:scale-105"
        style={{ color: "#f4c27a" }}
      >
        <Menu size={24} />
      </button>

      {/* Dark Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[200] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-[#6a1b1a] z-[210] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        
        {/* Sidebar Header */}
        <div className="p-4 flex justify-between items-center border-b border-[#f4c27a]/20 shrink-0">
          <span className="font-bold text-lg" style={{ color: "#f4c27a", letterSpacing: "0.5px" }}>Welcome, Dear Customer!</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "#f4c27a" }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location === path;
              return (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-2 py-3 transition-all duration-200 border-b-2 hover:border-[#f4c27a]
                    ${isActive ? "border-[#f4c27a]" : "border-transparent"}
                  `}
                  style={{ color: "#f4c27a" }}
                >
                  <Icon size={20} className={isActive ? "opacity-100" : "opacity-80"} />
                  <span className="font-semibold text-base">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Solid Order Now Button */}
          <button
            onClick={() => {
              navigate("/order-type");
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg mt-8 font-bold transition-transform duration-200 hover:scale-[1.02] shadow-md"
            style={{
              backgroundColor: "#f4c27a",
              color: "#6a1b1a"
            }}
          >
            <span className="text-base">Order Now</span>
          </button>
        </div>
      </div>
    </>
  );
}