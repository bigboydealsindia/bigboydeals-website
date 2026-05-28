"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Check,
  Loader2,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

import { saveDeal } from "@/app/actions/deals";
import { useBrandStore } from "@/store/useBrandStore";
import { getAllBrands } from "@/app/actions/brands";

interface Product {
  id: number;
  name: string;
  mainImage: string;
  sellingPrice: string;
  actualPrice: string;
  stock: number;
  brandId: number | null;
}

interface DealsClientProps {
  allProducts: Product[];
  currentDeal: {
    isActive: boolean;
    durationHours: number;
    productIds: number[];
  } | null;
}

export function DealsClient({ allProducts, currentDeal }: DealsClientProps) {
  const { brands, isLoaded: isBrandsLoaded, setBrands } = useBrandStore();

  const [isDealActive, setIsDealActive] = useState(
    currentDeal?.isActive ?? false,
  );
  const [hours, setHours] = useState(currentDeal?.durationHours || 24);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    currentDeal?.productIds || [],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const loadBrands = async () => {
      if (!isBrandsLoaded) {
        const data = await getAllBrands();
        setBrands(data);
      }
    };
    loadBrands();
  }, [isBrandsLoaded, setBrands]);

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeProducts = allProducts.filter((p) =>
    selectedProductIds.includes(p.id),
  );

  // TOGGLE SWITCH HANDLER
  const handleToggle = async () => {
    const newState = !isDealActive;
    setIsDealActive(newState);

    setIsSaving(true);
    const res = await saveDeal(hours, selectedProductIds, newState);
    if (res.success) {
      toast.success(`Storefront Deals turned ${newState ? "ON" : "OFF"}`, {
        description: newState
          ? `Timer started for ${hours} hours.`
          : "Deals are now hidden from users.",
      });
    } else {
      toast.error("Failed to update status");
      setIsDealActive(!newState);
    }
    setIsSaving(false);
  };

  const handleDecrement = async () => {
    if (hours > 24) {
      const newHours = hours - 24;
      setHours(newHours);

      setIsSaving(true);
      await saveDeal(newHours, selectedProductIds, isDealActive);
      toast.info(`Timer refreshed and set to ${newHours} Hours`);
      setIsSaving(false);
    }
  };

  const handleIncrement = async () => {
    if (hours < 72) {
      const newHours = hours + 24;
      setHours(newHours);

      setIsSaving(true);
      await saveDeal(newHours, selectedProductIds, isDealActive);
      toast.info(`Timer refreshed and set to ${newHours} Hours`);
      setIsSaving(false);
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const handleRemoveFromDeal = async (id: number) => {
    const updatedIds = selectedProductIds.filter((pId) => pId !== id);
    setSelectedProductIds(updatedIds);

    setIsSaving(true);
    const res = await saveDeal(hours, updatedIds, isDealActive);
    if (res.success) {
      toast.success("Product removed from deal");
    } else {
      toast.error("Failed to update deal");
      setSelectedProductIds(selectedProductIds);
    }
    setIsSaving(false);
  };

  const handleSaveDeal = async () => {
    setIsSaving(true);
    const res = await saveDeal(hours, selectedProductIds, isDealActive);
    if (res.success) {
      toast.success("Products Updated Successfully!");
      setIsSheetOpen(false);
    } else {
      toast.error("Failed to save deals.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Deals</h2>
          <p className="text-muted-foreground mt-1">
            Configure countdown timers and manage products for the Storefront
            deals section.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* CUSTOM TOGGLE SWITCH */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm font-semibold text-muted-foreground">
              {isDealActive ? "Live" : "Hidden"}
            </span>
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isDealActive
                  ? "bg-primary"
                  : "bg-secondary border border-border"
              }`}
            >
              <motion.span
                layout
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                  isDealActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center border border-border rounded-md bg-secondary/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecrement}
              disabled={hours <= 24 || isSaving}
              className="h-10 w-10 rounded-none rounded-l-md"
            >
              <Minus size={16} />
            </Button>
            <div className="w-24 h-10 flex items-center justify-center text-sm font-bold border-x border-border/50 bg-background">
              {hours} Hours
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIncrement}
              disabled={hours >= 72 || isSaving}
              className="h-10 w-10 rounded-none rounded-r-md"
            >
              <Plus size={16} />
            </Button>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-md h-10 px-6 shadow-sm">
                <Plus size={16} className="mr-2" /> Add Products
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="h-[85vh] w-full sm:max-w-[1400px] mx-auto flex flex-col rounded-t-xl sm:px-8 border-x"
            >
              <SheetHeader className="pb-4">
                <SheetTitle className="text-2xl font-bold">
                  Select Deal Products
                </SheetTitle>
                <div className="relative mt-2">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    placeholder="Search products by name..."
                    className="pl-10 h-11 bg-secondary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </SheetHeader>
              <Separator />
              <div className="flex-1 overflow-y-auto py-4 space-y-2 hide-scrollbar">
                <AnimatePresence>
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={product.id}
                        onClick={() => toggleProductSelection(product.id)}
                        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary/30"
                            : "bg-background border-border hover:bg-secondary/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover border border-border"
                          />
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{product.sellingPrice}
                            </p>
                          </div>
                        </div>
                        <div>
                          {isSelected ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle2
                                className="text-primary"
                                size={22}
                              />
                            </motion.div>
                          ) : (
                            <Circle
                              className="text-muted-foreground/50"
                              size={22}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <Separator />
              <SheetFooter className="pt-4 flex flex-row justify-end items-center gap-4 w-full pb-6 sm:pb-0">
                <span className="text-sm font-bold text-foreground">
                  {selectedProductIds.length} Selected
                </span>
                <Button
                  onClick={handleSaveDeal}
                  disabled={isSaving || selectedProductIds.length === 0}
                  className="rounded-md h-10 font-bold px-8"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Check size={16} className="mr-2" />
                  )}
                  Save Products
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Separator className="my-6" />

      {activeProducts.length === 0 ? (
        <div className="text-center p-20 bg-secondary/10 border border-dashed rounded-md text-muted-foreground mt-6">
          No deal products running. Click "Add Products" to setup.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-6">
          <AnimatePresence>
            {activeProducts.map((product) => {
              const brandName =
                brands.find((b) => b.id === product.brandId)?.name ||
                "Unbranded";

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={product.id}
                  className="bg-background border border-border rounded-md p-2.5 flex flex-col shadow-sm group hover:border-primary/20 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="relative w-full aspect-[4/5] bg-secondary/5 rounded-sm border border-border/50 overflow-hidden flex items-center justify-center p-1.5 mb-2.5">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col flex-1 px-0.5">
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground/70">
                        <Tag size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          {brandName}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${product.stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}
                      >
                        {product.stock > 0
                          ? `${product.stock} IN STOCK`
                          : "OUT OF STOCK"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-auto">
                      <span className="text-base font-bold text-foreground">
                        ₹{product.sellingPrice}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground line-through">
                        ₹{product.actualPrice}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-2.5 opacity-60" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromDeal(product.id)}
                    disabled={isSaving}
                    className="h-8 w-full rounded-md text-xs bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} className="mr-1.5" />
                    )}
                    Remove from Deal
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
