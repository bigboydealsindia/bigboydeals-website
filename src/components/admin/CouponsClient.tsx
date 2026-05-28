"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  TicketPercent,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  Loader2,
  Tag,
  Eye,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/app/actions/coupons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CouponsClient({
  initialCoupons,
  products,
}: {
  initialCoupons: any[];
  products: any[];
}) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Coupon Products View State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [viewedCouponProducts, setViewedCouponProducts] = useState<any | null>(
    null,
  );

  // Form States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"flat" | "overall_percent">("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Custom Multi-Select States
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setCode("");
    setType("flat");
    setDiscountValue("");
    setSelectedProducts([]);
    setIsActive(true);
    setIsDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditDialog = (coupon: any) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setDiscountValue(coupon.discountValue);
    setSelectedProducts(coupon.applicableProducts || []);
    setIsActive(coupon.isActive);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue)
      return toast.error("Please fill all required fields");

    setIsSubmitting(true);
    const data = {
      code,
      type,
      discountValue,
      applicableProducts: selectedProducts,
      isActive,
    };

    if (editingId) {
      const res = await updateCoupon(editingId, data);
      if (res.success) {
        toast.success("Coupon updated successfully!");
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...data } : c)),
        );
        setIsDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } else {
      const res = await createCoupon(data);
      if (res.success) {
        toast.success("Coupon added successfully!");
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setIsDeleting(id);
    const res = await deleteCoupon(id);
    if (res.success) {
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error("Failed to delete");
    }
    setIsDeleting(null);
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Coupons & Offers
          </h2>
          <p className="text-muted-foreground mt-1">
            Create and manage discount codes for your customers.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="h-10 px-6 font-bold rounded-md gap-2 shadow-md"
        >
          <Plus size={18} /> Add New Coupon
        </Button>
      </div>

      <Separator />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {coupons.map((coupon) => {
            const hasSpecificProducts = coupon.applicableProducts?.length > 0;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={coupon.id}
                className={`bg-background border rounded-md p-5 shadow-sm transition-all hover:shadow-md relative flex flex-col ${!coupon.isActive ? "opacity-70 grayscale-[30%]" : "border-border"}`}
              >
                {/* Top Right Status Badge */}
                <div
                  className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}
                >
                  {coupon.isActive ? "ACTIVE" : "INACTIVE"}
                </div>

                {/* Main Content */}
                <div className="flex-1 mt-1">
                  <h3 className="text-2xl font-black tracking-tight text-foreground uppercase mb-1 pr-16 break-all">
                    {coupon.code}
                  </h3>
                  <p className="text-base font-bold text-green-600 dark:text-green-500 mb-5">
                    {coupon.type === "flat"
                      ? `₹${coupon.discountValue} OFF`
                      : `${coupon.discountValue}% OFF`}
                  </p>

                  <div className="flex items-center justify-between bg-secondary/10 p-2.5 rounded-md border border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium line-clamp-1 flex-1 pr-2">
                      <Tag size={14} className="shrink-0 text-primary" />
                      <span className="truncate">
                        {hasSpecificProducts
                          ? `${coupon.applicableProducts.length} Specific Products`
                          : "All Products"}
                      </span>
                    </div>
                    {hasSpecificProducts && (
                      <button
                        onClick={() => setViewedCouponProducts(coupon)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors shrink-0"
                        title="View Products"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => openEditDialog(coupon)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-md font-bold text-xs h-9 border-border bg-background hover:bg-secondary/50"
                  >
                    <Edit size={14} className="mr-2" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(coupon.id)}
                    disabled={isDeleting === coupon.id}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-md font-bold text-xs h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-900/20"
                  >
                    {isDeleting === coupon.id ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : (
                      <Trash2 size={14} className="mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {coupons.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-md bg-secondary/5">
              <TicketPercent size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold text-foreground">
                No coupons found
              </p>
              <p className="text-sm">
                Click "Add New Coupon" to create your first discount code.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* VIEW PRODUCTS DIALOG */}
      <Dialog
        open={!!viewedCouponProducts}
        onOpenChange={(open) => !open && setViewedCouponProducts(null)}
      >
        <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-border bg-background">
          <DialogHeader className="p-5 border-b border-border bg-secondary/5">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <Package size={18} className="text-primary" /> Applicable Products
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-1">
              Products valid for coupon{" "}
              <span className="font-bold text-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                {viewedCouponProducts?.code}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {viewedCouponProducts?.applicableProducts.map((id: number) => {
              const p = products.find((prod) => prod.id === id);
              if (!p) return null;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors rounded-md"
                >
                  <div className="relative w-12 h-12 bg-secondary/20 rounded-md shrink-0 overflow-hidden border border-border/50">
                    {p.mainImage && (
                      <Image
                        src={p.mainImage}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl rounded-md border-border bg-background overflow-visible p-0">
          <DialogHeader className="p-6 border-b border-border bg-secondary/5">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              Set up the discount code, value, and applicable products.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Coupon Code <span className="text-destructive">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER50"
                  className="h-10 rounded-md uppercase font-semibold tracking-wider placeholder:normal-case placeholder:font-normal"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Discount Type <span className="text-destructive">*</span>
                </label>
                <Select
                  value={type}
                  onValueChange={(v: any) => setType(v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10 rounded-md font-medium">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                    <SelectItem value="overall_percent">
                      Percentage (%)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Discount Value {type === "flat" ? "(₹)" : "(%)"}{" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={type === "flat" ? "e.g. 500" : "e.g. 20"}
                className="h-10 rounded-md font-semibold"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-sm font-semibold text-foreground flex justify-between">
                Applicable Products
                <span className="text-muted-foreground font-normal text-xs">
                  (Leave empty for All Products)
                </span>
              </label>

              <div
                onClick={() =>
                  !isSubmitting && setIsDropdownOpen(!isDropdownOpen)
                }
                className={`flex items-center justify-between w-full h-10 px-3 border border-border rounded-md bg-background cursor-pointer hover:border-primary/50 transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`text-sm font-medium ${selectedProducts.length === 0 ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {selectedProducts.length === 0
                    ? "All Products Applied"
                    : `${selectedProducts.length} Products Selected`}
                </span>
                {selectedProducts.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProducts([]);
                    }}
                    className="h-6 px-2 text-xs rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {isDropdownOpen && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="p-2 border-b border-border bg-secondary/5">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-8 h-9 rounded-md text-sm"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto p-1.5 space-y-0.5">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedProducts.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductSelection(p.id)}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-secondary/50"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div className="relative w-8 h-8 bg-secondary/20 rounded-sm shrink-0 overflow-hidden border border-border/50">
                            {p.mainImage && (
                              <Image
                                src={p.mainImage}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span
                            className={`text-sm line-clamp-1 ${isSelected ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}
                          >
                            {p.name}
                          </span>
                        </div>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No products found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-secondary/10 p-4 rounded-md border border-border/50">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-foreground">
                  Coupon Status
                </label>
                <p className="text-xs text-muted-foreground font-medium">
                  Turn off to temporarily disable this coupon.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="rounded-md font-bold h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md font-bold h-10 gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />{" "}
                    {editingId ? "Updating..." : "Adding..."}
                  </>
                ) : editingId ? (
                  "Update Coupon"
                ) : (
                  "Add Coupon"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
