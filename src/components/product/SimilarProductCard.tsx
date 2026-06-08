"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, TrendingUp } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
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

interface SimilarProductCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    mainImage: string;
    sellingPrice: string;
    actualPrice: string;
    codAdvance: number;
    isMostSelling?: boolean;
  };
  brandName: string;
  discount: number;
}

export function SimilarProductCard({
  product,
  brandName,
  discount,
}: SimilarProductCardProps) {
  const router = useRouter();
  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const toggleItem = useWishlistStore((state) => state.toggleItem);

  const isWishlisted = wishlistIds.includes(product.id);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAuthDialogOpen(true);
      return;
    }

    toggleItem(product.id);

    const res = await toggleProductWishlist(product.id);

    if (!res.success) {
      toggleItem(product.id);
      toast.error("Action Failed", {
        description: "Could not update your wishlist.",
      });
    } else {
      toast.success(
        res.isWishlisted ? "Added to Wishlist" : "Removed from Wishlist",
      );
    }
  };

  const sellingPriceNum = Number(product.sellingPrice);
  const actualPriceNum = Number(product.actualPrice);

  return (
    <>
      <div className="group relative flex flex-col">
        <button
          onClick={handleWishlistClick}
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
              {brandName}
            </span>

            <h3 className="text-lg font-medium text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* NEW PRICING LAYOUT */}
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-foreground">
                  ₹{sellingPriceNum.toLocaleString("en-IN")}
                </span>
                {actualPriceNum > sellingPriceNum && (
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground line-through">
                    ₹{actualPriceNum.toLocaleString("en-IN")}
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

      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
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
    </>
  );
}
