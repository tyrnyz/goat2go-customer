import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { GuestSessionProvider, useGuestSession } from "./contexts/GuestSessionContext";
import { CartProvider } from "./contexts/CartContext";
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
      <Route path="/queue-confirmation/:orderId" component={QueueConfirmation} />
      <Route path="/receipt/:orderId" component={Receipt} />
      <Route path={"/my-orders"} component={MyOrders} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/about"} component={About} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SessionGate() {
  const { isLoading, hasError } = useGuestSession();

  if (isLoading) return null;

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-lg font-bold text-foreground font-sans mb-2">Unable to start your session</p>
          <p className="text-muted-foreground font-sans mb-6">Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg font-sans hover:opacity-90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <Router />;
}

function App() {
  return (
    <ErrorBoundary>
      <GuestSessionProvider>
        <CartProvider>
          <SessionGate />
        </CartProvider>
      </GuestSessionProvider>
    </ErrorBoundary>
  );
}

export default App;
