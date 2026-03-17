import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GuestSessionProvider } from "./contexts/GuestSessionContext";
import { CartProvider } from "./contexts/CartContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Contact from "./pages/Contact";
import About from "./pages/About";
import OrderType from "./pages/OrderType";
import Checkout from "./pages/Checkout";
import QueueConfirmation from "./pages/QueueConfirmation";
import Receipt from "./pages/Receipt";
import MyOrders from "./pages/MyOrders"; 
function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/order-type"} component={OrderType} />
      <Route path={"/menu"} component={Menu} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path="/queue-confirmation/:queueNumber" component={QueueConfirmation} />
      <Route path="/receipt/:orderId" component={Receipt} />
      <Route path={"/my-orders"} component={MyOrders} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/about"} component={About} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <GuestSessionProvider>
            <CartProvider>
              <OrdersProvider>
                <Toaster />
                <Router />
              </OrdersProvider>
            </CartProvider>
          </GuestSessionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
