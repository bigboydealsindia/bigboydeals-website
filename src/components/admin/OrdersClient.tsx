"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  CalendarDays,
  Clock,
  CreditCard,
  Banknote,
  ChevronRight,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  Clock4,
  RefreshCw,
  TicketPercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrdersClient({
  initialOrders,
}: {
  initialOrders: any[];
  storeInfo: any;
}) {
  const [orders] = useState(initialOrders);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock4,
          color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
        };
      case "processing":
        return {
          label: "Processing",
          icon: RefreshCw,
          color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
        };
      case "shipped":
        return {
          label: "Shipped",
          icon: Truck,
          color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
        };
      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          color: "text-green-600 bg-green-500/10 border-green-500/20",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          color: "text-red-600 bg-red-500/10 border-red-500/20",
        };
      default:
        return {
          label: "Unknown",
          icon: Package,
          color: "text-gray-600 bg-gray-500/10 border-gray-500/20",
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center border-2 border-dashed border-border rounded-md bg-secondary/5 mt-4">
        <div className="bg-secondary/20 p-5 sm:p-6 rounded-full mb-5 sm:mb-6">
          <ShoppingBag
            size={40}
            className="text-muted-foreground/50 sm:w-12 sm:h-12"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
          No Orders Yet
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md">
          Looks like you haven't placed any orders yet. Discover our latest
          collections and grab the best deals!
        </p>
        <Button
          asChild
          className="h-10 sm:h-11 px-6 sm:px-8 rounded-md font-bold uppercase tracking-wider text-sm"
        >
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500 pb-10">
      <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-4">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={10} className="opacity-60 sm:w-3 sm:h-3" />
        <Link href="/profile" className="hover:text-primary transition-colors">
          Profile
        </Link>
        <ChevronRight size={10} className="opacity-60 sm:w-3 sm:h-3" />
        <span className="text-foreground font-semibold">My Orders</span>
      </nav>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
          Order History
        </h1>
        <div className="bg-primary/10 text-primary px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
          <Package size={14} className="sm:w-4 sm:h-4" />
          {orders.length}{" "}
          <span className="hidden sm:inline">
            Order{orders.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Separator className="mb-4 sm:mb-6" />

      <div className="space-y-5 sm:space-y-6">
        <AnimatePresence>
          {orders.map((order) => {
            const isOnline =
              order.paymentMethod === "razorpay" ||
              order.paymentMethod === "online";

            const orderTotal = Number(order.totalAmount || 0);
            const couponDiscount = Number(order.couponDiscount || 0);

            // FIX: Removed hardcoded 100, replaced with dynamic codAdvancePaid from database
            const advancePaid = Number(order.codAdvancePaid || 0);
            const amountPaid = isOnline ? orderTotal : advancePaid;
            const balanceDue = isOnline ? 0 : orderTotal - advancePaid;

            const orderDate = new Date(order.createdAt);
            const statusConfig = getStatusDisplay(order.status);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="bg-background border border-border rounded-md shadow-sm overflow-hidden flex flex-col"
              >
                {/* Order Header - Highly Responsive */}
                <div className="bg-secondary/5 p-3 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                        ORDER #{order.id}
                      </h3>
                      <span
                        className={`px-2 py-0.5 border rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <statusConfig.icon
                          size={10}
                          className="sm:w-3 sm:h-3"
                        />{" "}
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={12} className="sm:w-3.5 sm:h-3.5" />
                        {orderDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                        {orderDate.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Total & Coupon Highlights on Mobile top */}
                  <div className="flex flex-row sm:flex-col justify-between items-end sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Order Total
                    </p>
                    <div className="flex flex-col items-end">
                      <p className="text-base sm:text-lg font-black text-foreground">
                        ₹{orderTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Applied Coupon Banner (If exists) */}
                {order.couponCode && couponDiscount > 0 && (
                  <div className="bg-green-500/10 border-b border-green-500/20 px-3 sm:px-5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <TicketPercent
                        size={14}
                        className="text-green-600 sm:w-4 sm:h-4"
                      />
                      <span className="text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide">
                        {order.couponCode} Applied
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-extrabold text-green-600">
                      -₹{couponDiscount.toLocaleString("en-IN")} Saved
                    </span>
                  </div>
                )}

                {/* Order Items - Responsive Layout */}
                <div className="p-0">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {order.items.map((itemObj: any, idx: number) => {
                    const prod = itemObj.product;
                    const variant = itemObj.variant;
                    const itemPrice = Number(itemObj.item.priceAtPurchase);

                    return (
                      <div
                        key={idx}
                        className="flex flex-row items-start gap-3 sm:gap-4 p-3 sm:p-5 border-b border-border/50 last:border-b-0 hover:bg-secondary/10 transition-colors"
                      >
                        {/* Left: Image */}
                        <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-secondary/20 rounded-md shrink-0 overflow-hidden border border-border">
                          {prod?.mainImage ? (
                            <Image
                              src={prod.mainImage}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] sm:text-[10px] font-medium text-muted-foreground">
                              No Img
                            </div>
                          )}
                        </div>

                        {/* Right: Details */}
                        <div className="flex-1 flex flex-col justify-between h-full min-h-[80px] sm:min-h-[96px] w-full">
                          <div className="space-y-1 sm:space-y-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-tight pr-2">
                              {prod?.name || "Unknown Product"}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1.5 mt-1 sm:mt-2">
                              {variant?.color && (
                                <div className="flex items-center gap-1 text-[10px] sm:text-xs bg-secondary/40 px-1.5 py-0.5 rounded-sm">
                                  <span className="text-muted-foreground font-medium">
                                    Color:
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {variant.color}
                                  </span>
                                </div>
                              )}
                              {variant?.size && (
                                <div className="flex items-center gap-1 text-[10px] sm:text-xs bg-secondary/40 px-1.5 py-0.5 rounded-sm">
                                  <span className="text-muted-foreground font-medium">
                                    Size:
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {variant.size}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs bg-secondary/40 px-1.5 py-0.5 rounded-sm border border-border/50">
                                <span className="text-muted-foreground font-medium">
                                  Qty:
                                </span>
                                <span className="font-bold text-foreground">
                                  {itemObj.item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 sm:mt-3 font-extrabold text-sm sm:text-base text-foreground">
                            ₹{itemPrice.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Summary Footer - Stacked on Mobile, Row on Desktop */}
                <div className="bg-secondary/10 p-3 sm:p-5 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                      {isOnline ? (
                        <CreditCard
                          size={14}
                          className="text-green-600 sm:w-4 sm:h-4"
                        />
                      ) : (
                        <Banknote
                          size={14}
                          className="text-amber-600 sm:w-4 sm:h-4"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                        Payment Method
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                        {isOnline ? "Online Pay" : "Cash on Delivery"}
                        <span
                          className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-sm ${isOnline ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {isOnline ? "PAID" : "ADVANCED"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Grid layout for amounts on mobile to save vertical space */}
                  <div className="grid grid-cols-2 md:flex items-center gap-3 sm:gap-6 w-full md:w-auto bg-background p-2.5 sm:p-3 md:p-0 md:bg-transparent rounded-md border border-border md:border-none">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] sm:text-xs font-bold text-muted-foreground mb-0.5 sm:mb-1">
                        Amount Paid
                      </p>
                      <p className="text-sm sm:text-base font-black text-foreground">
                        ₹{amountPaid.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="h-8 hidden md:block"
                    />
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs font-bold text-muted-foreground mb-0.5 sm:mb-1">
                        Balance Due
                      </p>
                      <p
                        className={`text-sm sm:text-base font-black ${balanceDue > 0 ? "text-red-500" : "text-green-600"}`}
                      >
                        ₹{balanceDue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
