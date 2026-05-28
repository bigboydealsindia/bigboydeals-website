"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItemListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartDetails: any[];
  isUpdating: number | null;
  handleUpdateQuantity: (id: number, qty: number) => void;
  setDeleteDialogItem: (id: number | null) => void;
}

export function CartItemList({
  cartDetails,
  isUpdating,
  handleUpdateQuantity,
  setDeleteDialogItem,
}: CartItemListProps) {
  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {cartDetails.map((item) => {
          if (!item.product) return null;
          const prod = item.product;
          const colorObj = prod.colorVariants?.find(
            (c: any) => c.name === item.color,
          );
          const colorHex = colorObj ? colorObj.hex : "#ccc";

          return (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              key={item.id}
              className="relative flex bg-background border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
            >
              <button
                onClick={() => setDeleteDialogItem(item.id)}
                className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors z-10"
              >
                <Trash2 size={18} />
              </button>

              <Link href={`/product/${prod.slug}`} className="block shrink-0">
                <div className="w-28 h-36 sm:w-32 sm:h-40 bg-secondary/10 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-border/50">
                  <div className="relative w-full h-full">
                    <Image
                      src={prod.mainImage}
                      alt={prod.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </div>
              </Link>

              <div className="flex flex-col flex-1 pl-4 sm:pl-6 py-1">
                <Link href={`/product/${prod.slug}`} className="pr-10">
                  <h3 className="text-base sm:text-lg font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                    {prod.name}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-2 mt-1.5 mb-3">
                  <span className="text-lg sm:text-xl font-bold text-foreground">
                    ₹{Number(prod.sellingPrice).toLocaleString("en-IN")}
                  </span>
                  {Number(prod.actualPrice) > Number(prod.sellingPrice) && (
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground line-through">
                      ₹{Number(prod.actualPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Color:</span>
                    <div className="flex items-center gap-1 bg-secondary/20 px-2 py-0.5 rounded-full border border-border/50">
                      <span
                        className="w-3 h-3 rounded-full border border-border block shadow-inner"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span className="text-xs text-foreground font-semibold">
                        {item.color}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Size:</span>
                    <span className="text-xs font-bold text-foreground bg-secondary/20 px-2 py-0.5 rounded-md border border-border/50">
                      {item.size}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-md bg-secondary/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1 || isUpdating === item.id}
                      className="h-8 w-8 rounded-none rounded-l-md hover:bg-secondary/50 text-foreground"
                    >
                      <Minus size={14} />
                    </Button>
                    <div className="w-10 h-8 flex items-center justify-center text-sm font-bold border-x border-border/50 bg-background">
                      {isUpdating === item.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin text-muted-foreground"
                        />
                      ) : (
                        item.quantity
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={isUpdating === item.id}
                      className="h-8 w-8 rounded-none rounded-r-md hover:bg-secondary/50 text-foreground"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
