import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGuestSession } from "@/contexts/GuestSessionContext";
import { fetchOrdersBySession } from "@/lib/orderService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ChefHat, List } from "lucide-react";
import type { DbOrder } from "@/types/database";
import Header from "@/components/Header";

function getStatusColor(status: DbOrder["status"]) {
  switch (status) {
    case "Completed":
      return "bg-gray-50 border-gray-200 text-gray-700";
    case "Preparing":
      return "bg-orange-50 border-orange-200 text-orange-700";
    default:
      return "bg-gray-50 border-gray-200 text-gray-700";
  }
}

function getStatusIcon(status: DbOrder["status"]) {
  switch (status) {
    case "Completed":
      return <CheckCircle className="w-4 h-4" />;
    case "Preparing":
      return <ChefHat className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusLabel(status: DbOrder["status"]) {
  switch (status) {
    case "Completed":
      return "Completed";
    case "Preparing":
      return "Being Prepared";
    default:
      return "Pending";
  }
}

export default function MyOrders() {
  const [, setLocation] = useLocation();
  const { sessionId } = useGuestSession();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [pollError, setPollError] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const data = await fetchOrdersBySession(sessionId);
        setOrders(data);
        setPollError(false);
      } catch {
        setPollError(true);
      }
    };

    // Initial fetch
    poll();

    // Poll every 5 seconds for status updates
    const interval = setInterval(poll, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const displayedOrders = statusFilter === "all"
    ? orders
    : statusFilter === "pending"
      ? orders.filter((order) => order.status !== "Completed")
      : orders.filter((order) => order.status === "Completed");

  // Highly Compact Order Card Layout
  const OrderCard = ({ order }: { order: DbOrder }) => (
    <Card className={`border-l-4 hover:shadow-md transition-shadow bg-card ${order.status === 'Completed' ? 'border-l-gray-400 opacity-80' : 'border-l-primary'}`}>
      <div className="p-3 md:p-4">
        
        {/* Top Row: Queue, Status Badge, Total Price */}
        <div className="flex justify-between items-start mb-2 border-b border-border/50 pb-2">
          <div>
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider font-sans mb-0.5">Queue</p>
            <p className={`text-2xl md:text-3xl font-bold font-sans leading-none ${order.status === 'Completed' ? 'text-gray-600' : 'text-primary'}`}>
              {order.queueNumber}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-bold text-[10px] md:text-xs font-sans whitespace-nowrap">
                {getStatusLabel(order.status)}
              </span>
            </div>
            <p className={`font-bold font-sans text-sm md:text-base ${order.status === 'Completed' ? 'text-gray-700' : 'text-primary'}`}>
              #{order.orderID}
            </p>
          </div>
        </div>

        {/* Middle Row: Type and Time */}
        <div className="flex gap-4 text-xs font-sans text-gray-600 mb-3">
          <span><strong className="text-gray-500 font-semibold uppercase text-[10px]">Type:</strong> {order.orderType}</span>
          <span><strong className="text-gray-500 font-semibold uppercase text-[10px]">Date:</strong> {new Date(order.orderTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(order.orderTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Bottom Row: Slim Action Button */}
        <Button
          onClick={() => setLocation(`/receipt/${order.orderID}`)}
          variant="outline"
          size="sm"
          className={`w-full h-8 text-xs font-sans font-bold ${
            order.status === 'Completed'
              ? 'text-gray-600 border-gray-400 hover:bg-gray-100'
              : 'text-primary border-primary hover:bg-primary/10'
          }`}
        >
          View Receipt
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        
        {/* Header and Dropdown Controls */}
        <div className="flex items-center justify-between border-b pb-3 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold font-sans text-primary capitalize">
            {statusFilter === "all" ? "All Orders" : `${statusFilter} Orders`}
          </h2>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "completed")}
            className="p-1.5 md:p-2 border border-border rounded-md font-sans text-xs md:text-sm font-semibold text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-card cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Orders</option>
            <option value="completed">Completed Orders</option>
          </select>
        </div>

        {/* Poll error notice */}
        {pollError && (
          <p className="text-xs text-muted-foreground font-sans mb-3 animate-pulse">
            Having trouble refreshing — retrying...
          </p>
        )}

        {/* Displaying the filtered list */}
        {displayedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {displayedOrders.map((order) => (
              <OrderCard key={order.orderID} order={order} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-muted/10 rounded-lg p-8 flex flex-col items-center justify-center border border-dashed border-border/50 min-h-[200px] mt-4">
            {statusFilter === "pending" ? (
              <Clock className="w-8 h-8 md:w-10 md:h-10 text-gray-400 mb-3" />
            ) : statusFilter === "completed" ? (
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-300 mb-3" />
            ) : (
              <List className="w-8 h-8 md:w-10 md:h-10 text-gray-400 mb-3" />
            )}
            
            <p className="text-gray-500 font-sans text-sm md:text-base">
              {statusFilter === "all" ? "No orders found" : `No ${statusFilter} orders found`}
            </p>
            
            {orders.length === 0 && (
              <Button
                onClick={() => setLocation("/order-type")}
                className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold px-6 py-2 text-sm"
              >
                Start Ordering
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}