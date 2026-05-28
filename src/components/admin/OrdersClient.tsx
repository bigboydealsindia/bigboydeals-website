"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Eye,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  CreditCard,
  Banknote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateOrderStatus } from "@/app/actions/admin-orders";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { InvoiceDialog } from "./InvoiceDialog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrdersClient({
  initialOrders,
  storeInfo,
}: {
  initialOrders: any[];
  storeInfo: any;
}) {
  const [orders, setOrders] = useState(initialOrders);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewDetails, setViewDetails] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setIsUpdating(orderId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await updateOrderStatus(orderId, newStatus as any);

    if (res.success) {
      toast.success("Order status updated successfully!");
      setOrders((prev) =>
        prev.map((o) =>
          o.order.id === orderId
            ? { ...o, order: { ...o.order, status: newStatus } }
            : o,
        ),
      );
    } else {
      toast.error("Failed to update status");
    }
    setIsUpdating(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-600/10 border-yellow-600/20";
      case "processing":
        return "text-blue-600 bg-blue-600/10 border-blue-600/20";
      case "shipped":
        return "text-purple-600 bg-purple-600/10 border-purple-600/20";
      case "delivered":
        return "text-green-600 bg-green-600/10 border-green-600/20";
      case "cancelled":
        return "text-red-600 bg-red-600/10 border-red-600/20";
      default:
        return "text-gray-600 bg-gray-600/10 border-gray-600/20";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Orders</h2>
          <p className="text-muted-foreground mt-1">
            Track, update, and generate invoices for customer orders.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          <Package size={18} />
          Total Orders: {orders.length}
        </div>
      </div>

      <Separator />

      <div className="rounded-xl border border-border overflow-hidden bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="h-12 px-4 font-semibold min-w-[200px]">
                  User Details
                </th>
                <th className="h-12 px-4 font-semibold min-w-[200px]">
                  Order Info
                </th>
                <th className="h-12 px-4 font-semibold min-w-[250px]">
                  Delivery Address
                </th>
                <th className="h-12 px-4 font-semibold min-w-[160px]">
                  Status Action
                </th>
                <th className="h-12 px-4 font-semibold text-right min-w-[220px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground font-medium"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((data) => {
                    const { order, user } = data;
                    const address = order.shippingAddress;
                    const orderIsOnline =
                      order.paymentMethod === "razorpay" ||
                      order.paymentMethod === "online";

                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={order.id}
                        className="border-b border-border/50 hover:bg-secondary/10 transition-colors"
                      >
                        <td className="p-4 align-top">
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold text-foreground flex items-center gap-2">
                              <User
                                size={14}
                                className="text-muted-foreground"
                              />
                              {user?.fullName || "Guest"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                              <Mail size={12} /> {user?.email || "N/A"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                              <Phone size={12} /> {user?.phone || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold text-foreground">
                              #{order.id}
                            </span>
                            <span className="text-sm font-extrabold text-foreground">
                              ₹
                              {Number(order.totalAmount).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                              {orderIsOnline ? (
                                <CreditCard size={12} />
                              ) : (
                                <Banknote size={12} />
                              )}
                              {orderIsOnline ? "ONLINE PAY" : "COD"}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed max-w-[250px] font-medium">
                            <MapPin
                              size={14}
                              className="shrink-0 mt-0.5 text-primary"
                            />
                            <span>
                              {address?.street}, {address?.city},<br />
                              {address?.state} - {address?.pin}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              handleStatusChange(order.id, val)
                            }
                            disabled={isUpdating === order.id}
                          >
                            <SelectTrigger
                              className={`h-9 text-xs font-bold border rounded-md ${getStatusColor(order.status)}`}
                            >
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem
                                value="pending"
                                className="font-medium"
                              >
                                Pending
                              </SelectItem>
                              <SelectItem
                                value="processing"
                                className="font-medium"
                              >
                                Processing
                              </SelectItem>
                              <SelectItem
                                value="shipped"
                                className="font-medium"
                              >
                                Shipped
                              </SelectItem>
                              <SelectItem
                                value="delivered"
                                className="font-medium"
                              >
                                Delivered
                              </SelectItem>
                              <SelectItem
                                value="cancelled"
                                className="font-medium"
                              >
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="p-4 align-top text-right space-y-2">
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              onClick={() => setViewDetails(data)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-bold w-[140px] justify-start rounded-md border-border hover:bg-secondary"
                            >
                              <Eye size={14} className="mr-2" /> View Details
                            </Button>
                            <Button
                              onClick={() => setViewInvoice(data)}
                              size="sm"
                              className="h-8 text-xs font-bold w-[140px] justify-start rounded-md"
                            >
                              <FileText size={14} className="mr-2" /> View
                              Invoice
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Render the Modals */}
      <OrderDetailsDialog
        isOpen={!!viewDetails}
        onClose={() => setViewDetails(null)}
        detailsData={viewDetails}
      />

      <InvoiceDialog
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        invoiceData={viewInvoice}
        storeInfo={storeInfo}
      />
    </div>
  );
}
