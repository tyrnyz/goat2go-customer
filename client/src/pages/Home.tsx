import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Clock, MapPin, ChefHat, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { MenuItem, loadMenuFromSupabase } from "@/lib/menuData";

export default function Home() {
  const [, navigate] = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadError, setLoadError] = useState(false);

  const loadMenu = () => {
    setLoadError(false);
    loadMenuFromSupabase()
      .then((items) => { setMenuItems(items); setLoadError(false); })
      .catch(() => { setMenuItems([]); setLoadError(true); });
  };

  useEffect(() => { loadMenu(); }, []);

  // Derive best sellers and explore items from live data
  const bestSellers = menuItems.filter((item) => item.isBestSeller).slice(0, 3);
  const exploreItems = menuItems
    .filter((item) => !item.isBestSeller && ['meat', 'fish', 'vegetables'].includes(item.category))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />

      {/* Hero Section */}
      <section
        className="relative py-12 h-[400px] md:h-[500px] flex items-center justify-center shadow-inner bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(/other_images/welcome_bg.png)"
        }}
      >
        <div className="container px-4 relative z-10">
          <div className="text-center space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-7xl font-bold font-sans tracking-tight text-white drop-shadow-md">
              Welcome to Tatun's
            </h1>
            <p className="text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-sans text-gray-200 drop-shadow">
              Authentic Filipino cuisine and Tarlac's finest goat meat specialties, served with love.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Info Banner */}
      <section className="bg-primary text-primary-foreground py-4 md:py-8 shadow-md relative z-20 -mt-6 mx-4 md:mx-auto max-w-6xl rounded-2xl">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-6 text-center divide-x divide-primary-foreground/20 px-2 md:px-0">
          <div className="flex flex-col items-center justify-start p-2">
            <ChefHat className="w-6 h-6 md:w-8 md:h-8 mb-1.5 md:mb-3 opacity-90" />
            <h3 className="font-bold text-[11px] sm:text-xs md:text-lg font-sans leading-tight">
              Authentic<br className="md:hidden" /> Recipes
            </h3>
            <p className="text-sm opacity-80 font-sans hidden md:block mt-1">Traditional flavors passed down through generations.</p>
          </div>
          <div className="flex flex-col items-center justify-start p-2">
            <Clock className="w-6 h-6 md:w-8 md:h-8 mb-1.5 md:mb-3 opacity-90" />
            <h3 className="font-bold text-[11px] sm:text-xs md:text-lg font-sans leading-tight">
              Freshly<br className="md:hidden" /> Prepared
            </h3>
            <p className="text-sm opacity-80 font-sans hidden md:block mt-1">Cooked hot and fresh daily just for you.</p>
          </div>
          <div className="flex flex-col items-center justify-start p-2">
            <MapPin className="w-6 h-6 md:w-8 md:h-8 mb-1.5 md:mb-3 opacity-90" />
            <h3 className="font-bold text-[11px] sm:text-xs md:text-lg font-sans leading-tight">
              Tarlac's<br className="md:hidden" /> Pride
            </h3>
            <p className="text-sm opacity-80 font-sans hidden md:block mt-1">Locally loved and a must-visit destination.</p>
          </div>
        </div>
      </section>

      {/* Customer Favorites */}
      {loadError ? (
        <section className="py-12 md:py-16 bg-background">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center px-4">
            <p className="text-muted-foreground text-lg mb-4 font-sans">Could not load menu data.</p>
            <button onClick={loadMenu} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold font-sans hover:opacity-90">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </section>
      ) : bestSellers.length > 0 ? (
        <section className="py-12 md:py-16 bg-background">
          <div className="container px-4">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-4xl font-bold text-primary font-sans">Customer Favorites</h2>
              <p className="text-sm md:text-base text-muted-foreground font-sans">The undisputed champions of our menu.</p>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:mx-auto max-w-5xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {bestSellers.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate("/menu")}
                  className="group relative bg-card rounded-2xl overflow-hidden shadow-md border border-border/50 hover:shadow-xl transition-all duration-300 cursor-pointer md:hover:-translate-y-2 flex-none w-[85%] sm:w-[300px] md:w-auto snap-center"
                >
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-secondary text-secondary-foreground px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold z-10 font-sans shadow-md">
                    #{index + 1} Best Seller
                  </div>
                  <div className="w-full h-40 md:h-56 bg-muted overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-0" />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = '/other_images/tatuns_logo.png'; }}
                    />
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-primary mb-1 md:mb-2 font-sans group-hover:text-secondary transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 font-sans">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-base md:text-lg text-primary font-bold font-sans">
                        ₱{item.price.toFixed(2)}
                      </p>
                      <span className="text-primary/60 group-hover:text-primary md:group-hover:translate-x-1 transition-all">
                        <ArrowRight size={18} className="md:w-5 md:h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Explore More */}
      {!loadError && exploreItems.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary font-sans mb-1">Explore More Specialties</h2>
              <p className="text-sm md:text-base text-muted-foreground font-sans">Discover more of our authentic dishes.</p>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:mx-auto max-w-6xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {exploreItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-border/40 transition-shadow cursor-pointer flex flex-col flex-none w-[65%] sm:w-[220px] md:w-full h-full font-sans group snap-center"
                  onClick={() => navigate("/menu")}
                >
                  <div className="w-full h-32 md:h-40 bg-muted overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = '/other_images/tatuns_logo.png'; }}
                    />
                  </div>
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h3 className="text-sm md:text-base font-bold text-primary mb-1 line-clamp-1 font-sans">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 flex-1 line-clamp-2 font-sans hidden md:block">{item.description}</p>
                    <p className="text-sm text-primary font-bold font-sans mt-auto">₱{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 md:mt-10">
              <button
                onClick={() => navigate("/menu")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-card text-primary rounded-full border border-primary/20 font-bold hover:bg-primary hover:text-primary-foreground transition-all font-sans shadow-sm"
              >
                View Full Menu
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section className="py-16 bg-primary text-primary-foreground border-t border-border/10">
        <div className="container px-4 text-center max-w-3xl mx-auto">
          <ChefHat className="w-12 h-12 mx-auto text-primary-foreground mb-4 opacity-90" />
          <h2 className="text-3xl font-bold font-sans mb-6">About Us</h2>
          <p className="text-base md:text-lg text-primary-foreground/90 leading-relaxed mb-8 font-sans">
            Tatun's Kambingan is a Filipino restaurant located in Tarlac City, Philippines,
            that specializes in authentic goat meat dishes. The restaurant is popular for
            its stews, grilled specialties, and traditional Filipino comfort food. It is
            known for being a "must-visit" for food lovers seeking traditional Filipino cuisine.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-full font-bold font-sans transition-all shadow-lg hover:scale-105"
          >
            Get in Touch
          </button>
        </div>
      </section>
    </div>
  );
}
