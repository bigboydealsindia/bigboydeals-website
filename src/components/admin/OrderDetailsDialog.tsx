"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, MapPin, Package } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrderDetailsDialog({
  isOpen,
  onClose,
  detailsData,
}: {
  isOpen: boolean;
  onClose: () => void;
  detailsData: any;
}) {
  if (!detailsData) return null;

  const { order, user, items } = detailsData;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden border-border bg-background">
        <DialogHeader className="p-5 border-b border-border bg-secondary/5">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Package className="text-primary" /> Order{" "}
            <span className="text-muted-foreground">#{order?.id}</span>
          </DialogTitle>
          <DialogDescription className="hidden">
            Detailed view of user order
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-background p-4 rounded-xl border border-border shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                <User size={14} /> Customer Info
              </h4>
              <p className="font-bold text-foreground text-base">
                {user?.fullName || "Guest"}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {user?.email || "N/A"}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {user?.phone || "N/A"}
              </p>
            </div>
            <div className="bg-background p-4 rounded-xl border border-border shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                <MapPin size={14} /> Shipping Address
              </h4>
              <p className="text-sm font-medium leading-relaxed text-foreground">
                {order?.shippingAddress?.street},<br />
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state}
                <br />
                PIN: {order?.shippingAddress?.pin}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-3 tracking-tight">
              Items Purchased
            </h4>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {items.map((itemObj: any, idx: number) => {
                const prod = itemObj.product;
                const variant = itemObj.variant;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-secondary/5 border border-border/50 p-3 rounded-xl"
                  >
                    <div className="relative w-16 h-20 bg-background rounded-lg overflow-hidden shrink-0 border border-border">
                      {prod?.mainImage ? (
                        <Image
                          src={prod.mainImage}
                          alt="Product"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h5 className="font-bold text-sm text-foreground line-clamp-1">
                        {prod?.name || "Unknown Product"}
                      </h5>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-medium text-muted-foreground">
                          Qty:{" "}
                          <strong className="text-foreground">
                            {itemObj.item.quantity}
                          </strong>
                        </span>
                        {variant?.color && (
                          <span className="font-medium text-muted-foreground">
                            Color:{" "}
                            <strong className="text-foreground">
                              {variant.color}
                            </strong>
                          </span>
                        )}
                        {variant?.size && (
                          <span className="font-medium text-muted-foreground">
                            Size:{" "}
                            <strong className="text-foreground">
                              {variant.size}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-base text-foreground">
                      ₹
                      {Number(itemObj.item.priceAtPurchase).toLocaleString(
                        "en-IN",
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
