"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Heart,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Copy,
  MessageCircle,
  Package,
  AlertCircle,
  Flame,
  XCircle,
  TicketPercent,
  CheckCircle2,
  Loader2,
  CreditCard,
  Banknote,
  X,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useWishlistStore } from "@/store/useWishlistStore";
import { toggleProductWishlist } from "@/app/actions/wishlist";
import { useCartStore } from "@/store/useCartStore";
import { addProductToCart } from "@/app/actions/cart";
import { createClient } from "@/utils/supabase/client";

// Backend Actions
import { getActiveCoupons } from "@/app/actions/coupons";
import { getUserProfile } from "@/app/actions/auth";
import { quickSaveAddress } from "@/app/actions/user";
import { createRazorpayOrderId, confirmOrder } from "@/app/actions/order";

interface ProductDetailsProps {
  product: {
    id: number;
    name: string;
    sellingPrice: string;
    actualPrice: string;
    codAdvance: number;
    keyFeatures: string[];
    colorVariants: { hex: string; name: string; path: string }[];
    sizeVariants: string[];
    description: string | null;
    stock: number;
    averageRating?: number;
    totalReviews?: number;
    mainImage?: string;
  };
  brandName: string;
}

type ActionType = "buy" | "cart" | "wishlist" | null;

export function ProductDetails({ product, brandName }: ProductDetailsProps) {
  const router = useRouter();

  // Basic Product States
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colorVariants?.[0]?.name || "",
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Data States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbUser, setDbUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localAppliedCoupon, setLocalAppliedCoupon] = useState<any | null>(
    null,
  );

  // Global Stores
  const wishlistIds = useWishlistStore((state) => state.wishlistIds) || [];
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = wishlistIds.includes(product.id);

  const cartItems = useCartStore((state) => state.cartItems) || [];
  const addItemToStore = useCartStore((state) => state.addItem);
  const setGlobalAppliedCoupon = useCartStore(
    (state) => state.setAppliedCoupon,
  );

  // Modal States
  const [isShaking, setIsShaking] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    action: ActionType;
  }>({ open: false, action: null });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Buy Now Flow States
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Payment States
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Calculate Prices
  const sellingPriceNum = Number(product.sellingPrice);
  const actualPriceNum = Number(product.actualPrice);
  const baseDiscount =
    actualPriceNum > 0 && sellingPriceNum < actualPriceNum
      ? Math.round(((actualPriceNum - sellingPriceNum) / actualPriceNum) * 100)
      : 0;
  const currentStock = product.stock ?? 0;
  const avgRating = product.averageRating || 0;
  const totalRev = product.totalReviews || 0;

  // Initial Data Load
  useEffect(() => {
    getUserProfile().then((user) => {
      setDbUser(user);
      if (user) {
        setAddressForm({
          streetAddress: user.streetAddress || "",
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
          country: user.country || "India",
        });
      }
    });
    getActiveCoupons().then((coupons) => setAllCoupons(coupons));
  }, []);

  const applicableCoupons = useMemo(() => {
    return allCoupons.filter(
      (coupon) =>
        !coupon.applicableProducts ||
        coupon.applicableProducts.length === 0 ||
        coupon.applicableProducts.includes(product.id),
    );
  }, [allCoupons, product.id]);

  const couponDiscountAmount = useMemo(() => {
    if (!localAppliedCoupon) return 0;
    if (localAppliedCoupon.type === "flat") {
      return Math.min(
        Number(localAppliedCoupon.discountValue),
        sellingPriceNum,
      );
    } else {
      return Math.round(
        (sellingPriceNum * Number(localAppliedCoupon.discountValue)) / 100,
      );
    }
  }, [localAppliedCoupon, sellingPriceNum]);

  const finalAmount = Math.max(0, sellingPriceNum - couponDiscountAmount);

  const shakeVariants: Variants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    idle: { x: 0 },
  };

  const handleColorSelect = (col: {
    hex: string;
    name: string;
    path: string;
  }) => {
    if (col.path && col.path.trim() !== "") {
      const redirectUrl = col.path.startsWith("http")
        ? col.path
        : `https://${col.path}`;
      window.open(redirectUrl, "_blank");
    } else {
      setSelectedColor(col.name);
    }
  };

  const validateSelection = (action: ActionType) => {
    const needsColor =
      product.colorVariants && product.colorVariants.length > 0;
    const needsSize = product.sizeVariants && product.sizeVariants.length > 0;
    if ((needsColor && !selectedColor) || (needsSize && !selectedSize)) {
      setAlertConfig({ open: true, action });
      return false;
    }
    return true;
  };

  const handleActionClick = async (action: ActionType) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAuthDialogOpen(true);
      return;
    }

    if (action === "wishlist") {
      toggleItem(product.id);
      const res = await toggleProductWishlist(product.id);
      if (!res.success) {
        toggleItem(product.id);
        toast.error("Action Failed");
      } else {
        toast.success(
          res.isWishlisted ? "Added to Wishlist" : "Removed from Wishlist",
        );
      }
      return;
    }

    if (!validateSelection(action)) return;

    if (action === "cart") {
      const isAlreadyInCart = cartItems.some(
        (i) =>
          i.productId === product.id &&
          i.color === selectedColor &&
          i.size === selectedSize,
      );
      if (isAlreadyInCart) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        toast.error("Already added to cart");
        return;
      }

      const res = await addProductToCart(
        product.id,
        selectedColor,
        selectedSize,
      );
      if (res.success && res.id) {
        addItemToStore({
          id: res.id,
          productId: product.id,
          color: selectedColor,
          size: selectedSize,
          quantity: 1,
          codAdvance: product.codAdvance,
        });
        if (localAppliedCoupon) setGlobalAppliedCoupon(localAppliedCoupon);
        toast.success("Added to Cart successfully!");
      }
      return;
    }

    if (action === "buy") {
      if (
        !dbUser?.streetAddress ||
        !dbUser?.city ||
        !dbUser?.state ||
        !dbUser?.pincode
      ) {
        setAddressDialogOpen(true);
      } else {
        setReviewDialogOpen(true);
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    const res = await quickSaveAddress(addressForm);
    if (res.success) {
      setDbUser(res.user);
      setAddressDialogOpen(false);
      setReviewDialogOpen(true);
    } else {
      toast.error("Failed to save address");
    }
    setIsSavingAddress(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) return toast.error("Payment Gateway Error");

    const amountToPay =
      paymentMethod === "online" ? finalAmount : (product.codAdvance ?? 100);
    setIsProcessingOrder(true);

    const orderRes = await createRazorpayOrderId(amountToPay);
    if (!orderRes.success || !orderRes.orderId) {
      setIsProcessingOrder(false);
      return toast.error("Payment Initialization Failed.");
    }

    const options = {
      key:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id_here",
      amount: Math.round(amountToPay * 100), // Ensures absolute integer for Razorpay
      currency: "INR",
      name: "Big Boy Deals",
      description:
        paymentMethod === "cod" ? "COD Security Deposit" : "Order Payment",
      order_id: orderRes.orderId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (response: any) {
        setIsVerifyingPayment(true);
        toast.loading("Verifying and confirming order...", { id: "confirm" });

        const mockCart = [
          {
            productId: product.id,
            color: selectedColor || "Default",
            size: selectedSize || "Default",
            quantity: 1,
            product: { ...product, sellingPrice: sellingPriceNum },
          },
        ];

        const confirmRes = await confirmOrder({
          totalAmount: finalAmount,
          codAdvancePaid:
            paymentMethod === "cod" ? (product.codAdvance ?? 100) : finalAmount,
          paymentMethod: paymentMethod === "online" ? "razorpay" : "cod",
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          shippingAddress: {
            street: dbUser.streetAddress,
            city: dbUser.city,
            state: dbUser.state,
            pin: dbUser.pincode,
          },
          cartDetails: mockCart,
          couponCode: localAppliedCoupon?.code || null,
          couponDiscount: couponDiscountAmount,
        });

        if (confirmRes.success) {
          toast.success("Order Placed!", { id: "confirm" });
          router.push("/order-success");
        } else {
          setIsVerifyingPayment(false);
          // SHOWING EXACT DB ERROR NOW
          toast.error(confirmRes.error || "Order failed.", { id: "confirm" });
        }
      },
      prefill: {
        name: dbUser?.fullName || "",
        email: dbUser?.email || "",
        contact: dbUser?.phone || "",
      },
      theme: { color: "#0f172a" },
    };

    setReviewDialogOpen(false);
    setIsProcessingOrder(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const handleApplyCouponModal = () => {
    const code = couponCodeInput.trim().toUpperCase();
    const matched = applicableCoupons.find((c) => c.code === code);
    if (!matched) return toast.error("Invalid or inapplicable coupon code.");
    setLocalAppliedCoupon(matched);
    setCouponCodeInput("");
    toast.success("Coupon Applied!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
    setIsShareOpen(false);
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
    setIsShareOpen(false);
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
    setIsShareOpen(false);
  };

  if (isVerifyingPayment) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm min-h-screen">
        <div className="bg-background border border-border p-8 rounded-md shadow-xl flex flex-col items-center text-center max-w-sm w-full mx-4">
          <Loader2 className="animate-spin text-primary mb-6" size={48} />
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Processing Order...
          </h2>
          <p className="text-muted-foreground text-sm">
            Please wait... <br />
            <span className="font-semibold text-foreground">
              Do not close or refresh this page.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-primary uppercase tracking-widest block">
          {brandName}
        </span>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground leading-tight">
          {product.name}
        </h1>
      </div>

      {totalRev > 0 ? (
        <div className="flex items-center gap-3 bg-secondary/10 w-fit px-3 py-1.5 rounded-md border border-border/30">
          <div className="flex items-center gap-1 text-sm font-bold text-foreground">
            <span>{avgRating.toFixed(1)}</span>
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <Separator orientation="vertical" className="h-4 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">
            {totalRev} Happy Customer{totalRev !== 1 ? "s" : ""}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-secondary/10 w-fit px-3 py-1.5 rounded-md border border-border/30">
          <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
            <Star size={14} />
            <span>No reviews yet</span>
          </div>
        </div>
      )}

      {product.keyFeatures && product.keyFeatures.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.keyFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="flex w-fit items-center gap-2.5 px-3 py-2 rounded-md border border-rose-100/50"
              style={{ backgroundColor: "var(--color-burgundy-50, #fff1f2)" }}
            >
              <span className="text-base leading-none">
                {feat.split(" ")[0]}
              </span>
              <span className="text-xs font-semibold text-rose-950 dark:text-rose-300 leading-tight">
                {feat.split(" ").slice(1).join(" ")}
              </span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-1"
        >
          {currentStock > 10 && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-500">
              <Package size={16} />
              <span>In Stock, ready to ship</span>
            </div>
          )}
          {currentStock >= 5 && currentStock <= 10 && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-500">
              <AlertCircle size={16} />
              <span>Selling fast, only {currentStock} left</span>
            </div>
          )}
          {currentStock > 0 && currentStock < 5 && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-destructive">
              <Flame size={16} />
              <span>Hurry up, only {currentStock} stocks are available</span>
            </div>
          )}
          {currentStock === 0 && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-destructive">
              <XCircle size={16} />
              <span>Currently Out of Stock</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={finalAmount}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              ₹{finalAmount.toLocaleString("en-IN")}
            </motion.span>
          </AnimatePresence>
          {(baseDiscount > 0 || couponDiscountAmount > 0) && (
            <span className="text-sm sm:text-base text-muted-foreground line-through font-medium">
              ₹{actualPriceNum.toLocaleString("en-IN")}
            </span>
          )}
          {baseDiscount > 0 && !localAppliedCoupon && (
            <span className="text-xs font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              {baseDiscount}% OFF
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium text-muted-foreground">
          Inclusive of all taxes
        </p>

        {applicableCoupons.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            <AnimatePresence>
              {localAppliedCoupon ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-700 px-3 py-1.5 rounded-md cursor-pointer"
                >
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="text-xs font-bold uppercase">
                    {localAppliedCoupon.code} Applied
                  </span>
                  <button
                    onClick={() => setLocalAppliedCoupon(null)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                applicableCoupons.map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setLocalAppliedCoupon(coupon);
                      toast.success(`Coupon Applied!`);
                    }}
                    className="flex items-center gap-1.5 border border-dashed border-primary/50 bg-primary/5 text-primary px-3 py-1.5 rounded-md cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <TicketPercent size={14} />
                    <span className="text-xs font-bold uppercase">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] font-semibold border-l border-primary/30 pl-1.5 ml-0.5">
                      {coupon.type === "flat"
                        ? `₹${coupon.discountValue} OFF`
                        : `${coupon.discountValue}% OFF`}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Separator />

      {product.colorVariants && product.colorVariants.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span>Color:</span>
            <span className="text-foreground font-semibold">
              {selectedColor ? selectedColor : "Select one"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.colorVariants.map((col, idx) => (
              <button
                key={idx}
                onClick={() => handleColorSelect(col)}
                className={`w-8 h-8 rounded-full border relative p-0.5 flex items-center justify-center transition-all ${
                  selectedColor === col.name
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-border/60 hover:scale-105"
                }`}
                title={col.name}
              >
                <span
                  className="w-full h-full rounded-full block shadow-inner"
                  style={{ backgroundColor: col.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizeVariants && product.sizeVariants.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span>Size:</span>
            <span className="text-foreground font-semibold">
              {selectedSize ? selectedSize : "Select one"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizeVariants.map((sz, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSize(sz)}
                className={`h-9 min-w-10 px-3 border rounded-md text-xs font-bold transition-all flex items-center justify-center ${
                  selectedSize === sz
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border hover:bg-secondary/50 text-foreground"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2.5 pt-2">
        <Button
          onClick={() => handleActionClick("buy")}
          disabled={currentStock === 0}
          className="w-full h-11 text-sm font-bold rounded-md uppercase tracking-wider shadow-sm"
        >
          <ShoppingBag size={16} className="mr-2" /> Buy Now
        </Button>

        <div className="flex items-center gap-2">
          <motion.div
            className="flex-1"
            animate={isShaking ? "shake" : "idle"}
            variants={shakeVariants}
          >
            <Button
              variant="outline"
              onClick={() => handleActionClick("cart")}
              disabled={currentStock === 0}
              className="w-full h-11 text-sm font-bold rounded-md uppercase tracking-wider transition-colors border-border"
            >
              <ShoppingCart size={16} className="mr-2" /> Add to Cart
            </Button>
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleActionClick("wishlist")}
            className={`h-11 w-11 rounded-md transition-colors border-border ${isWishlisted ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 hover:text-rose-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="h-11 w-11 rounded-md border-border text-muted-foreground hover:text-foreground"
            >
              <Share2 size={18} />
            </Button>
            <AnimatePresence>
              {isShareOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 bottom-14 w-48 bg-background border border-border shadow-lg rounded-md overflow-hidden z-50"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Share this product
                  </div>
                  <Separator />
                  <div className="flex flex-col p-1">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/50 rounded-md transition-colors text-left"
                    >
                      <Copy size={14} className="text-muted-foreground" /> Copy
                      Link
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/50 rounded-md transition-colors text-left text-green-600"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                    <button
                      onClick={handleShareFacebook}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/50 rounded-md transition-colors text-left text-blue-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Separator />

      {product.description && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Description
          </h3>
          <div
            className="prose prose-sm max-w-full overflow-hidden break-words text-foreground/90 leading-relaxed ql-editor p-0"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-border bg-background">
          <DialogHeader className="p-6 border-b border-border bg-secondary/5">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Shipping Address
            </DialogTitle>
            <DialogDescription>
              Enter your delivery details to proceed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">
                Street Address / Apartment / Suite
              </label>
              <Input
                required
                value={addressForm.streetAddress}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    streetAddress: e.target.value,
                  })
                }
                className="rounded-md border-border h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">
                  City
                </label>
                <Input
                  required
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                  className="rounded-md border-border h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">
                  State
                </label>
                <Input
                  required
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                  className="rounded-md border-border h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">
                  Pin Code
                </label>
                <Input
                  required
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, pincode: e.target.value })
                  }
                  className="rounded-md border-border h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">
                  Country
                </label>
                <Input
                  required
                  value={addressForm.country}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, country: e.target.value })
                  }
                  className="rounded-md border-border h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddressDialogOpen(false)}
                disabled={isSavingAddress}
                className="rounded-md font-bold h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingAddress}
                className="rounded-md font-bold h-10 min-w-[140px]"
              >
                {isSavingAddress ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />{" "}
                    Saving...
                  </>
                ) : (
                  "Save and Continue"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review & Pay Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-xl rounded-md p-0 overflow-hidden border-border bg-background">
          <DialogHeader className="p-6 border-b border-border bg-secondary/5">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Review & Pay
            </DialogTitle>
            <DialogDescription>Confirm details and pay.</DialogDescription>
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
            <div className="bg-secondary/10 p-4 rounded-md border border-border/50 flex justify-between items-start">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin size={14} /> Delivery Address
                </h4>
                <p className="font-bold text-foreground text-sm">
                  {dbUser?.fullName}
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">
                  {dbUser?.streetAddress}, {dbUser?.city}, {dbUser?.state} -{" "}
                  {dbUser?.pincode}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/profile")}
                className="h-8 text-xs font-bold text-primary hover:bg-primary/10 rounded-md"
              >
                Change
              </Button>
            </div>

            <div className="flex items-center gap-4 border border-border p-3 rounded-md">
              <div className="relative w-16 h-20 bg-secondary/20 rounded-md overflow-hidden shrink-0 border border-border/50">
                {product.mainImage ? (
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                    No Img
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-sm text-foreground line-clamp-1 mb-1">
                  {product.name}
                </h5>
                <div className="flex gap-3 text-xs text-muted-foreground font-medium">
                  <span>Qty: 1</span>
                  {selectedColor && <span>Color: {selectedColor}</span>}
                  {selectedSize && <span>Size: {selectedSize}</span>}
                </div>
              </div>
              <div className="font-black text-lg">
                ₹{sellingPriceNum.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="space-y-3">
              {localAppliedCoupon ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <TicketPercent
                      size={18}
                      className="text-green-600 dark:text-green-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-green-700 dark:text-green-400 text-sm">
                        {localAppliedCoupon.code} Applied
                      </span>
                      <span className="text-[10px] font-medium text-green-600/80 dark:text-green-500/80">
                        You saved ₹
                        {couponDiscountAmount.toLocaleString("en-IN")} extra!
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setLocalAppliedCoupon(null)}
                    className="p-1.5 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) =>
                        setCouponCodeInput(e.target.value.toUpperCase())
                      }
                      className="uppercase h-10 font-semibold tracking-wider rounded-md border-border bg-background placeholder:normal-case placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-primary/50"
                    />
                    <Button
                      onClick={handleApplyCouponModal}
                      disabled={!couponCodeInput.trim()}
                      className="h-10 font-bold px-5 rounded-md shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                  {applicableCoupons.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Available Coupons
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {applicableCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            onClick={() => {
                              setLocalAppliedCoupon(coupon);
                              toast.success(`Coupon Applied!`);
                            }}
                            className="cursor-pointer border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 p-2.5 rounded-md transition-colors w-full flex items-center justify-between group"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-primary text-sm tracking-wide">
                                {coupon.code}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                {coupon.type === "flat"
                                  ? `Flat ₹${coupon.discountValue} OFF`
                                  : `${coupon.discountValue}% OFF`}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-primary px-2 group-hover:scale-105 transition-transform">
                              APPLY
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between items-center bg-secondary/5 p-4 rounded-md border border-border/50">
              <span className="font-bold text-muted-foreground">
                Total Amount
              </span>
              <span className="text-2xl font-black text-foreground">
                ₹{finalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod("online")}
                className={`relative flex items-center justify-between p-4 rounded-md border-2 cursor-pointer transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "online" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "online" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Pay Online</span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      Secure: UPI, Cards, Netbanking
                    </span>
                  </div>
                </div>
                <CreditCard
                  size={24}
                  className={
                    paymentMethod === "online"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
              </div>

              <div
                onClick={() => setPaymentMethod("cod")}
                className={`relative flex items-center justify-between p-4 rounded-md border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "cod" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Cash on Delivery</span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      Pay cash upon receiving (₹{product.codAdvance ?? 100}{" "}
                      advance)
                    </span>
                  </div>
                </div>
                <Banknote
                  size={24}
                  className={
                    paymentMethod === "cod"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                disabled={isProcessingOrder}
                className="rounded-md font-bold h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayNow}
                disabled={isProcessingOrder}
                className="rounded-md font-bold h-10 min-w-[140px]"
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />{" "}
                    Processing...
                  </>
                ) : paymentMethod === "online" ? (
                  `Pay ₹${finalAmount.toLocaleString("en-IN")}`
                ) : (
                  `Pay ₹${product.codAdvance ?? 100} Advance`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Required Selection & Auth Dialogs */}
      <AlertDialog
        open={alertConfig.open}
        onOpenChange={(open) => setAlertConfig({ ...alertConfig, open })}
      >
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Selection Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please make sure to select both a specific preferred color and
              appropriate size variant before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertConfig({ open: false, action: null })}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setAlertConfig({ open: false, action: null })}
              className="rounded-md"
            >
              Yes, Understand
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl flex items-center gap-2">
              Hold up, Trendsetter! ✨
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              Looks like you&apos;re exploring as a guest. Please log in first
              to secure your cart, make a purchase, or save your favorites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
