import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { GuestSessionProvider } from "./contexts/GuestSessionContext";
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

function App() {
  return (
    <ErrorBoundary>
      <GuestSessionProvider>
        <CartProvider>
          <Router />
        </CartProvider>
      </GuestSessionProvider>
    </ErrorBoundary>
  );
}

export default App;
