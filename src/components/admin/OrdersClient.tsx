"use client";

import { useState } from "react";
import { Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import { toast } from "sonner";
import { InvoiceDialog } from "./InvoiceDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

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
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewDetails, setViewDetails] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setIsUpdating(orderId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await updateOrderStatus(orderId, newStatus as any);
    if (res.success) {
      toast.success("Order status updated!");
      setOrders(
        orders.map((row) =>
          row.order.id === orderId
            ? { ...row, order: { ...row.order, status: newStatus } }
            : row,
        ),
      );
    } else {
      toast.error("Failed to update status");
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Orders</h1>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-md text-sm font-bold">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="bg-background border border-border rounded-md shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Order ID & Date</th>
              <th className="px-4 py-3 whitespace-nowrap">Customer Info</th>
              <th className="px-4 py-3 whitespace-nowrap">Amount & Payment</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((row) => {
              const o = row.order;
              const u = row.user;

              const isOnline =
                o.paymentMethod === "online" || o.paymentMethod === "razorpay";
              const total = Number(o.totalAmount || 0);
              const advance = o.codAdvancePaid ? Number(o.codAdvancePaid) : 0;
              const paid = isOnline ? total : advance;

              return (
                <tr
                  key={o.id}
                  className="hover:bg-secondary/10 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-extrabold text-foreground">
                      #{o.id}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(o.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-foreground">
                      {u?.fullName || "Guest"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {u?.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-black text-foreground">
                      ₹{total.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm inline-block mt-1 bg-secondary border border-border">
                      {isOnline
                        ? "Online Pay (Paid)"
                        : `COD (Adv: ₹${advance})`}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs font-bold border border-border rounded-md p-1.5 bg-background focus:ring-1 focus:ring-primary outline-none"
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, e.target.value)
                        }
                        disabled={isUpdating === o.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {isUpdating === o.id && (
                        <Loader2
                          size={14}
                          className="animate-spin text-primary"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs font-bold rounded-md"
                        onClick={() => setViewDetails(row)}
                      >
                        <Eye size={14} className="mr-1.5" /> Details
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-2 text-xs font-bold rounded-md"
                        onClick={() => setViewInvoice(row)}
                      >
                        <FileText size={14} className="mr-1.5" /> Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!viewDetails}
        onOpenChange={(open) => !open && setViewDetails(null)}
      >
        <DialogContent className="max-w-2xl rounded-md bg-background border-border">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-xl font-bold">
              Order Details #{viewDetails?.order?.id}
            </DialogTitle>
          </DialogHeader>
          {viewDetails && (
            <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/10 rounded-md border border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Customer Info
                  </h3>
                  <p className="font-bold">{viewDetails.user?.fullName}</p>
                  <p className="text-sm">{viewDetails.user?.email}</p>
                  <p className="text-sm">{viewDetails.user?.phone}</p>
                </div>
                <div className="p-4 bg-secondary/10 rounded-md border border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-sm leading-snug">
                    {viewDetails.order?.shippingAddress?.street}, <br />
                    {viewDetails.order?.shippingAddress?.city},{" "}
                    {viewDetails.order?.shippingAddress?.state} -{" "}
                    {viewDetails.order?.shippingAddress?.pin}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b border-border pb-2 mb-3">
                  Ordered Items
                </h3>
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {viewDetails.items.map((itemObj: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 border border-border rounded-md"
                    >
                      <div className="w-16 h-16 relative bg-secondary/20 rounded-sm overflow-hidden shrink-0">
                        {itemObj.product?.mainImage && (
                          <Image
                            src={itemObj.product.mainImage}
                            alt="Product"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {itemObj.product?.name}
                        </p>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          <span>Qty: {itemObj.item.quantity}</span>
                          {itemObj.variant?.color && (
                            <span>Color: {itemObj.variant.color}</span>
                          )}
                          {itemObj.variant?.size && (
                            <span>Size: {itemObj.variant.size}</span>
                          )}
                        </div>
                      </div>
                      <div className="font-black text-sm">
                        ₹
                        {Number(itemObj.item.priceAtPurchase).toLocaleString(
                          "en-IN",
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      {viewInvoice && (
        <InvoiceDialog
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          invoiceData={viewInvoice}
          storeInfo={storeInfo}
        />
      )}
    </div>
  );
}
