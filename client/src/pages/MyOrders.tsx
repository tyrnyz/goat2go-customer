import { useState } from "react";
import { useLocation } from "wouter";
import { useOrders } from "@/contexts/OrdersContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle, Clock, AlertCircle, List } from "lucide-react";
import { Order } from "@shared/types";
import Header from "@/components/Header";

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "preparing":
      return "bg-blue-50 border-blue-200 text-blue-700";
    case "ready":
      return "bg-amber-50 border-amber-200 text-amber-700";
    case "completed":
      return "bg-gray-50 border-gray-200 text-gray-700";
    default:
      return "bg-gray-50 border-gray-200 text-gray-700";
  }
}

// Reduced icon size from w-5 to w-4 for a more compact look
function getStatusIcon(status: Order["status"]) {
  switch (status) {
    case "preparing":
      return <Clock className="w-4 h-4" />;
    case "ready":
      return <AlertCircle className="w-4 h-4" />;
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready to Pickup";
    case "completed":
      return "Completed";
    default:
      return "Pending";
  }
}

export default function MyOrders() {
  const [, setLocation] = useLocation();
  const { orders } = useOrders();
  
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const displayedOrders = statusFilter === "all" 
    ? orders 
    : statusFilter === "pending"
      ? orders.filter((order) => order.status !== "completed")
      : orders.filter((order) => order.status === "completed");

  // Highly Compact Order Card Layout
  const OrderCard = ({ order }: { order: Order }) => (
    <Card className={`border-l-4 hover:shadow-md transition-shadow bg-card ${order.status === 'completed' ? 'border-l-gray-400 opacity-80' : 'border-l-primary'}`}>
      <div className="p-3 md:p-4">
        
        {/* Top Row: Queue, Status Badge, Total Price */}
        <div className="flex justify-between items-start mb-2 border-b border-border/50 pb-2">
          <div>
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider font-sans mb-0.5">Queue</p>
            <p className={`text-2xl md:text-3xl font-bold font-sans leading-none ${order.status === 'completed' ? 'text-gray-600' : 'text-primary'}`}>
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
            <p className={`font-bold font-sans text-sm md:text-base ${order.status === 'completed' ? 'text-gray-700' : 'text-primary'}`}>
              ₱{order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Middle Row: Type, Time, and Items */}
        <div className="mb-3 space-y-1.5">
          <div className="flex gap-4 text-xs font-sans text-gray-600">
            <span><strong className="text-gray-500 font-semibold uppercase text-[10px]">Type:</strong> {order.orderType === "dine-in" ? "Dine-In" : "Take-Out"}</span>
            <span><strong className="text-gray-500 font-semibold uppercase text-[10px]">Time:</strong> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {/* Items string compressed to 1 or 2 lines */}
          <div className="text-xs font-sans text-gray-600 line-clamp-2 leading-relaxed">
            <span className="font-bold text-gray-700">Items: </span>
            {order.items.map(i => `${i.quantity}x ${i.itemName}`).join(", ")}
          </div>
        </div>

        {/* Bottom Row: Slim Action Button */}
        <Button
          onClick={() => setLocation(`/receipt/${order.orderId}`)}
          variant="outline"
          size="sm"
          className={`w-full h-8 text-xs font-sans font-bold ${
            order.status === 'completed' 
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

        {/* Displaying the filtered list */}
        {displayedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {displayedOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
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