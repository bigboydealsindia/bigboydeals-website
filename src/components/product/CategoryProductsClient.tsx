"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronRight,
  Heart,
  TrendingUp,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { createClient } from "@/utils/supabase/client";
import { toggleProductWishlist } from "@/app/actions/wishlist";
import { useWishlistStore } from "@/store/useWishlistStore";

interface CategoryProductsClientProps {
  currentCategory: any;
  subCategories: any[];
  products: any[];
  brands: any[];
}

export function CategoryProductsClient({
  currentCategory,
  subCategories,
  products,
  brands,
}: CategoryProductsClientProps) {
  const router = useRouter();

  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Filter States
  const [selectedSubCat, setSelectedSubCat] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  // Strict Price Bounds from filtered collection items
  const prices = products.map((p) => Number(p.sellingPrice) || 0);
  const absoluteMinPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const absoluteMaxPrice = prices.length > 0 ? Math.max(...prices) : 1000;
  const safeMaxPrice =
    absoluteMaxPrice === absoluteMinPrice
      ? absoluteMaxPrice + 100
      : absoluteMaxPrice;

  const [localPriceRange, setLocalPriceRange] = useState([
    absoluteMinPrice,
    safeMaxPrice,
  ]);
  const [priceRange, setPriceRange] = useState([
    absoluteMinPrice,
    safeMaxPrice,
  ]);

  const [minInput, setMinInput] = useState(absoluteMinPrice.toString());
  const [maxInput, setMaxInput] = useState(safeMaxPrice.toString());

  // Colors mapping from primary variants only
  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => {
      if (p.colorVariants && p.colorVariants.length > 0) {
        colors.add(p.colorVariants[0].name);
      }
    });
    return Array.from(colors);
  }, [products]);

  // Count items per subcategory within this main collection
  const getSubCatCount = (id: number) =>
    products.filter((p) => p.subCategoryId === id).length;

  // Filter Processing Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedSubCat) {
      result = result.filter((p) => p.subCategoryId === selectedSubCat);
    }

    result = result.filter((p) => {
      const price = Number(p.sellingPrice);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        if (!p.colorVariants || p.colorVariants.length === 0) return false;
        return selectedColors.includes(p.colorVariants[0].name);
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price_asc":
          return Number(a.sellingPrice) - Number(b.sellingPrice);
        case "price_desc":
          return Number(b.sellingPrice) - Number(a.sellingPrice);
        case "popularity":
          return b.isMostSelling === a.isMostSelling
            ? 0
            : b.isMostSelling
              ? 1
              : -1;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [products, selectedSubCat, priceRange, selectedColors, sortBy]);

  const handleWishlistClick = async (
    e: React.MouseEvent,
    productId: number,
  ) => {
    e.preventDefault();
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAuthDialogOpen(true);
      return;
    }

    toggleItem(productId);
    const res = await toggleProductWishlist(productId);

    if (!res.success) {
      toggleItem(productId);
      toast.error("Action Failed", {
        description: "Could not update your wishlist.",
      });
    } else {
      toast.success(
        res.isWishlisted ? "Added to Wishlist" : "Removed from Wishlist",
      );
    }
  };

  const calculateDiscount = (selling: string, actual: string) => {
    const s = Number(selling);
    const a = Number(actual);
    if (a <= 0 || s >= a) return 0;
    return Math.round(((a - s) / a) * 100);
  };

  const handlePriceGo = () => {
    let min = Number(minInput);
    let max = Number(maxInput);
    if (isNaN(min)) min = absoluteMinPrice;
    if (isNaN(max)) max = safeMaxPrice;

    if (min < absoluteMinPrice) min = absoluteMinPrice;
    if (max > safeMaxPrice) max = safeMaxPrice;
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    setLocalPriceRange([min, max]);
    setPriceRange([min, max]);
    setMinInput(min.toString());
    setMaxInput(max.toString());
  };

  const FilterSidebarContent = () => (
    <div className="space-y-6 pb-8">
      {/* Subcategory locked layout block */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg tracking-tight">Sub Categories</h3>
        <Separator />
        <div className="space-y-2.5">
          <div
            className={`text-sm cursor-pointer flex items-center justify-between hover:text-primary transition-colors ${!selectedSubCat ? "font-bold text-primary" : "text-muted-foreground"}`}
            onClick={() => setSelectedSubCat(null)}
          >
            <span>All {currentCategory.name}</span>
            <span className="text-xs opacity-60">({products.length})</span>
          </div>
          {subCategories.map((sub) => {
            const count = getSubCatCount(sub.id);
            if (count === 0) return null;
            return (
              <div
                key={sub.id}
                className={`text-sm cursor-pointer flex items-center justify-between hover:text-primary transition-colors ${selectedSubCat === sub.id ? "font-bold text-primary" : "text-muted-foreground"}`}
                onClick={() => setSelectedSubCat(sub.id)}
              >
                <span>{sub.name}</span>
                <span className="text-xs opacity-60">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Price filter configuration */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg tracking-tight">Price Range</h3>
        <div className="px-2 pt-4 pb-2">
          <Slider
            min={absoluteMinPrice}
            max={safeMaxPrice}
            step={10}
            value={localPriceRange}
            onValueChange={(val) => {
              setLocalPriceRange(val);
              setMinInput(val[0].toString());
              setMaxInput(val[1].toString());
            }}
            onValueCommit={(val) => {
              setPriceRange(val);
            }}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="h-9 text-sm rounded-md text-center"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="h-9 text-sm rounded-md text-center"
          />
          <Button
            onClick={handlePriceGo}
            size="sm"
            className="h-9 rounded-md px-4 font-bold bg-primary"
          >
            Go
          </Button>
        </div>
      </div>

      <Separator />

      {/* Colors dynamic configuration */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg tracking-tight">Colors</h3>
        <div className="space-y-3">
          {allColors.map((color) => (
            <div key={color} className="flex items-center gap-3">
              <Checkbox
                id={`cat-color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedColors([...selectedColors, color]);
                  } else {
                    setSelectedColors(
                      selectedColors.filter((c) => c !== color),
                    );
                  }
                }}
                className="rounded-[4px]"
              />
              <label
                htmlFor={`cat-color-${color}`}
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 min-h-screen">
      {/* 1. Breadcrumb navigation */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold truncate">
          {currentCategory.name} Collection
        </span>
      </nav>

      {/* 2. Collection Title */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {currentCategory.name} Collection
        </h1>
      </div>

      {/* 3. Horizontal Subcategory Pills Slider Rows */}
      {subCategories.length > 0 && (
        <div className="mb-8">
          <div
            className="flex items-center gap-2.5 overflow-x-auto pb-3 hide-scrollbar snap-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => setSelectedSubCat(null)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap border snap-start ${
                !selectedSubCat
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/40 border-border hover:bg-secondary text-foreground"
              }`}
            >
              All {currentCategory.name} ({products.length})
            </button>

            {subCategories.map((sub) => {
              const count = getSubCatCount(sub.id);
              if (count === 0) return null;
              const isSelected = selectedSubCat === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(isSelected ? null : sub.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap border snap-start ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/40 border-border hover:bg-secondary text-foreground"
                  }`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator className="mb-8" />

      {/* 4. Core Layout Divide */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar filter blocks */}
        <aside className="hidden md:block w-[260px] shrink-0 sticky top-24">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Filters</h2>
          <Separator className="mb-6" />
          <FilterSidebarContent />
        </aside>

        {/* Product listing grid blocks */}
        <div className="flex-1 w-full">
          {/* Mobile Drawers interface */}
          <div className="md:hidden w-full mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 font-bold flex items-center justify-center gap-2 rounded-md shadow-sm border-border"
                >
                  <SlidersHorizontal size={18} /> Filters & Specifications
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85vw] sm:max-w-md overflow-y-auto px-6 pt-12 pb-8"
              >
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left text-2xl font-bold">
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <FilterSidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          {/* Sorter and result count panels */}
          <div className="flex items-center justify-between mb-6 bg-secondary/10 p-3 rounded-lg border border-border/50">
            <span className="text-sm font-semibold text-muted-foreground">
              Showing{" "}
              <span className="text-foreground">{filteredProducts.length}</span>{" "}
              Products
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] sm:w-[180px] h-9 bg-background rounded-md text-sm font-semibold border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product display grid matrices */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-secondary/5">
              <X size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                No items match your selected filtering combinations within this
                collection view.
              </p>
              <Button
                onClick={() => {
                  setSelectedSubCat(null);
                  setSelectedColors([]);
                  setLocalPriceRange([absoluteMinPrice, safeMaxPrice]);
                  setPriceRange([absoluteMinPrice, safeMaxPrice]);
                  setMinInput(absoluteMinPrice.toString());
                  setMaxInput(safeMaxPrice.toString());
                }}
                variant="outline"
                className="mt-6 rounded-md"
              >
                Clear active filters
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const brand = brands.find((b) => b.id === product.brandId);
                  const discount = calculateDiscount(
                    product.sellingPrice,
                    product.actualPrice,
                  );
                  const isWishlisted = wishlistIds.includes(product.id);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={product.id}
                      className="group relative flex flex-col"
                    >
                      <button
                        onClick={(e) => handleWishlistClick(e, product.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full z-20 transition-all duration-300 backdrop-blur-md border ${
                          isWishlisted
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                            : "bg-white/30 text-white border-white/40 hover:bg-white/50"
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={isWishlisted ? "currentColor" : "none"}
                          className="transition-transform active:scale-90"
                        />
                      </button>

                      <Link
                        href={`/product/${product.slug}`}
                        className="flex flex-col flex-1"
                      >
                        <div className="relative w-full aspect-[4/5] bg-secondary/10 rounded-md overflow-hidden mb-2.5">
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />

                          {product.isMostSelling && (
                            <div className="absolute bottom-2 right-2 bg-yellow-400 text-yellow-950 text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm flex items-center gap-1 uppercase tracking-wider z-10">
                              <TrendingUp size={10} /> Most Selling
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col px-0.5">
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider line-clamp-1 mb-0.5">
                            {brand ? brand.name : "Exclusive"}
                          </span>
                          <h3 className="text-lg font-medium text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>

                          <div className="flex items-center justify-between mt-0.5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm sm:text-base font-bold text-foreground">
                                ₹
                                {Number(product.sellingPrice).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                              {Number(product.actualPrice) >
                                Number(product.sellingPrice) && (
                                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground line-through">
                                  ₹
                                  {Number(product.actualPrice).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              )}
                            </div>

                            {discount > 0 && (
                              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <AlertDialogContent className="rounded-[var(--radius)] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl flex items-center gap-2">
              Hold up, Trendsetter! <span className="text-2xl">✨</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
              Looks like you&apos;re exploring as a guest. Please log in first
              to secure your cart, make a purchase, or save your favorites to
              the wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setAuthDialogOpen(false)}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="rounded-md m-0"
            >
              Yes, Login
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
