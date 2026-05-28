"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, TrendingUp } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { getAllProducts } from "@/app/actions/products";
import { getAllBrands } from "@/app/actions/brands";
import { toggleProductWishlist } from "@/app/actions/wishlist";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function LatestProductsSection() {
  const router = useRouter();

  const products = useProductStore((state) => state.products);
  const productsLoaded = useProductStore((state) => state.isLoaded);
  const setProducts = useProductStore((state) => state.setProducts);

  const brands = useBrandStore((state) => state.brands);
  const brandsLoaded = useBrandStore((state) => state.isLoaded);
  const setBrands = useBrandStore((state) => state.setBrands);

  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const toggleItem = useWishlistStore((state) => state.toggleItem);

  const [authDialogOpen, setAuthDialogOpen] = useState(false);

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

  const latestProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 6);

  if (latestProducts.length === 0) return null;

  return (
    <section className="py-10 bg-secondary/5 border-y border-border/50">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-foreground text-2xl md:text-3xl font-medium tracking-tight">
            Our Latest Products
          </h2>
          <Link
            href="/all-products"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            View All <ChevronRight size={16} className="ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {latestProducts.map((product) => {
            const brand = brands.find((b) => b.id === product.brandId);
            const discount = calculateDiscount(
              product.sellingPrice,
              product.actualPrice,
            );
            const isWishlisted = wishlistIds.includes(product.id);

            return (
              <div key={product.id} className="group relative flex flex-col">
                <button
                  onClick={(e) => handleWishlistClick(e, product.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full z-20 transition-all duration-300 backdrop-blur-md border ${
                    isWishlisted
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                      : "bg-white/30 text-white border-white/40 hover:bg-white/50"
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart
                    size={16}
                    fill={isWishlisted ? "currentColor" : "none"}
                    className="transition-transform active:scale-90"
                  />
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  className="flex flex-col flex-1 bg-background rounded-md"
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

                  <div className="flex flex-col px-0.5 pb-2">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider line-clamp-1 mb-0.5">
                      {brand ? brand.name : "Exclusive"}
                    </span>

                    <h3 className="text-lg font-medium text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* NEW PRICING LAYOUT */}
                    <div className="flex items-center justify-between mt-0.5">
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

                      {discount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        {/* Same standard auth dialog UI */}
        <AlertDialogContent className="rounded-[var(--radius)] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl flex items-center gap-2">
              Hold up, Trendsetter! <span className="text-2xl">✨</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
              Looks like you&apos;re exploring as a guest. Please log in first
              to secure your cart, make a purchase, or save your favorites to
              the wishlist. Let&apos;s get you in!
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
    </section>
  );
}
