"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, Timer, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toggleProductWishlist } from "@/app/actions/wishlist";
import { getActiveDeal } from "@/app/actions/deals";
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

export function BestDealsSection() {
  const router = useRouter();

  const products = useProductStore((state) => state.products);
  const brands = useBrandStore((state) => state.brands);
  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const toggleItem = useWishlistStore((state) => state.toggleItem);

  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deal, setDeal] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      const activeDeal = await getActiveDeal();
      if (activeDeal && activeDeal.productIds.length > 0) {
        setDeal(activeDeal);
      } else {
        setIsExpired(true);
      }
      setIsLoading(false);
    };
    fetchDeal();
  }, []);

  useEffect(() => {
    if (!deal || !deal.endsAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(deal.endsAt).getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
        setIsCalculated(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deal]);

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

  if (
    isLoading ||
    isExpired ||
    !deal ||
    deal.productIds.length === 0 ||
    !isCalculated
  ) {
    return null;
  }

  const dealProducts = products.filter((p) => deal.productIds.includes(p.id));
  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <section className="py-10">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 className="text-foreground text-2xl md:text-3xl font-medium tracking-tight">
              Our Best Deals
            </h2>

            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-sm border border-primary/20">
              <Timer
                size={14}
                className="animate-spin-slow"
                style={{ animationDuration: "4s" }}
              />
              <div className="font-mono text-xs sm:text-sm font-bold tracking-widest tabular-nums flex items-center">
                <motion.span
                  key={`h-${timeLeft.hours}`}
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-block"
                >
                  {formatTime(timeLeft.hours)}
                </motion.span>
                <span className="mx-0.5 opacity-70">:</span>
                <motion.span
                  key={`m-${timeLeft.minutes}`}
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-block"
                >
                  {formatTime(timeLeft.minutes)}
                </motion.span>
                <span className="mx-0.5 opacity-70">:</span>
                <motion.span
                  key={`s-${timeLeft.seconds}`}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-block text-primary"
                >
                  {formatTime(timeLeft.seconds)}
                </motion.span>
              </div>
            </div>
          </div>

          <Link
            href="/all-products"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            View All <ChevronRight size={16} className="ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {dealProducts.map((product) => {
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
