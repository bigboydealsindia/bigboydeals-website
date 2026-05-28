"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, HeartCrack, Loader2 } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { getAllProducts } from "@/app/actions/products";
import { getAllBrands } from "@/app/actions/brands";
import { toggleProductWishlist } from "@/app/actions/wishlist";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export function WishlistClient() {
  const router = useRouter();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Global Stores
  const products = useProductStore((state) => state.products);
  const productsLoaded = useProductStore((state) => state.isLoaded);
  const setProducts = useProductStore((state) => state.setProducts);

  const brands = useBrandStore((state) => state.brands);
  const brandsLoaded = useBrandStore((state) => state.isLoaded);
  const setBrands = useBrandStore((state) => state.setBrands);

  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const toggleItem = useWishlistStore((state) => state.toggleItem);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!productsLoaded) {
        const data = await getAllProducts();
        setProducts(data);
      }
      if (!brandsLoaded) {
        const data = await getAllBrands();
        setBrands(data);
      }
    };
    loadData();
  }, [productsLoaded, brandsLoaded, setProducts, setBrands]);

  const handleWishlistClick = async (
    e: React.MouseEvent,
    productId: number,
  ) => {
    e.preventDefault();

    // Instant UI update to remove from list smoothly
    toggleItem(productId);

    // Database sync
    const res = await toggleProductWishlist(productId);

    if (!res.success) {
      // Revert if error
      toggleItem(productId);
      toast.error("Action Failed", {
        description: "Could not update your wishlist.",
      });
    } else {
      toast.success("Removed from Wishlist");
    }
  };

  const calculateDiscount = (selling: string, actual: string) => {
    const s = Number(selling);
    const a = Number(actual);
    if (a <= 0 || s >= a) return 0;
    return Math.round(((a - s) / a) * 100);
  };

  if (isAuthenticated === null || !productsLoaded || !brandsLoaded) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Handle Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="bg-secondary/20 p-6 rounded-full mb-6">
          <HeartCrack size={48} className="text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Login Required
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Please sign in to view and manage your saved products. We keep them
          secure for you!
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="h-11 px-8 rounded-md font-bold uppercase tracking-wider"
        >
          Sign In to Continue
        </Button>
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="w-full">
      {/* 1. Small Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">My Wishlist</span>
      </nav>

      {/* 2. Page Title */}
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          My Wishlist{" "}
          <span className="text-muted-foreground text-lg sm:text-xl font-normal ml-2">
            ({wishlistProducts.length})
          </span>
        </h1>
      </div>

      {/* 3. Horizontal Separator */}
      <Separator className="mb-8" />

      {/* 4. Content / Product Cards Grid */}
      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border rounded-xl bg-secondary/5">
          <Heart size={64} className="text-muted-foreground/30 mb-6" />
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Looks like you haven&apos;t added any products to your wishlist yet.
            Explore our collections and save your favorites!
          </p>
          <Button
            onClick={() => router.push("/")}
            className="h-11 px-8 rounded-md font-bold uppercase tracking-wider"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          <AnimatePresence>
            {wishlistProducts.map((product) => {
              const brand = brands.find((b) => b.id === product.brandId);
              const discount = calculateDiscount(
                product.sellingPrice,
                product.actualPrice,
              );
              // Since it is rendering here, it must be wishlisted
              const isWishlisted = true;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
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
                    aria-label="Remove from Wishlist"
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

                      {discount > 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-sm shadow-sm z-10 tracking-wide">
                          {discount}% OFF
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

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-bold text-foreground">
                          ₹
                          {Number(product.sellingPrice).toLocaleString("en-IN")}
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
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
