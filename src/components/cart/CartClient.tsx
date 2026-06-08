"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ShoppingCart, Loader2 } from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import { useProductStore } from "@/store/useProductStore";
import { removeCartItem, updateCartItemQuantity } from "@/app/actions/cart";
import { getAllProducts } from "@/app/actions/products";
import { createRazorpayOrderId, confirmOrder } from "@/app/actions/order";
import { getActiveCoupons } from "@/app/actions/coupons";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CartItemList } from "./CartItemList";
import { OrderSummary } from "./OrderSummary";

interface DBUser {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  role: "user" | "admin" | "staff";
  createdAt: Date;
}

interface CartClientProps {
  user: DBUser;
}

export function CartClient({ user }: CartClientProps) {
  const router = useRouter();

  const cartItems = useCartStore((state) => state.cartItems) || [];
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCartState = useCartStore((state) => state.setCartItems);

  // SMART SYNC: Accessing Coupon globally from useCartStore instead of local useState
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon);

  const products = useProductStore((state) => state.products);
  const productsLoaded = useProductStore((state) => state.isLoaded);
  const setProducts = useProductStore((state) => state.setProducts);

  const [deleteDialogItem, setDeleteDialogItem] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isCheckoutShaking, setIsCheckoutShaking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allActiveCoupons, setAllActiveCoupons] = useState<any[]>([]);

  const isAddressEmpty =
    !user.streetAddress || !user.city || !user.state || !user.pincode;

  useEffect(() => {
    const loadData = async () => {
      if (!productsLoaded) {
        const data = await getAllProducts();
        setProducts(data);
      }
      const couponsData = await getActiveCoupons();
      setAllActiveCoupons(couponsData);
    };
    loadData();
  }, [productsLoaded, setProducts]);

  const cartDetails = useMemo(() => {
    return cartItems
      .map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        return { ...cartItem, product };
      })
      .filter((item) => item.product !== undefined);
  }, [cartItems, products]);

  const subTotal = useMemo(() => {
    return cartDetails.reduce((total, item) => {
      if (!item.product) return total;
      return total + Number(item.product.sellingPrice) * item.quantity;
    }, 0);
  }, [cartDetails]);

  const totalDiscount = useMemo(() => {
    return cartDetails.reduce((total, item) => {
      if (!item.product) return total;
      const actual = Number(item.product.actualPrice);
      const selling = Number(item.product.sellingPrice);
      if (actual > selling) {
        return total + (actual - selling) * item.quantity;
      }
      return total;
    }, 0);
  }, [cartDetails]);

  const availableCoupons = useMemo(() => {
    return allActiveCoupons.filter((coupon) => {
      if (!coupon.applicableProducts || coupon.applicableProducts.length === 0)
        return true;
      return cartDetails.some((item) =>
        coupon.applicableProducts.includes(item.productId),
      );
    });
  }, [allActiveCoupons, cartDetails]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    const eligibleAmount = cartDetails.reduce((total, item) => {
      if (!item.product) return total;

      const isApplicable =
        !appliedCoupon.applicableProducts ||
        appliedCoupon.applicableProducts.length === 0 ||
        appliedCoupon.applicableProducts.includes(item.productId);
      if (isApplicable) {
        return total + Number(item.product.sellingPrice) * item.quantity;
      }
      return total;
    }, 0);

    if (eligibleAmount === 0) return 0;

    let discount = 0;
    if (appliedCoupon.type === "flat") {
      discount = Math.min(Number(appliedCoupon.discountValue), eligibleAmount);
    } else if (appliedCoupon.type === "overall_percent") {
      discount = Math.round(
        (eligibleAmount * Number(appliedCoupon.discountValue)) / 100,
      );
    }

    return discount;
  }, [appliedCoupon, cartDetails]);

  const finalAmount = Math.max(0, subTotal - couponDiscount);

  const totalCodAdvance = useMemo(() => {
    return cartDetails.reduce((total, item) => {
      if (!item.product) return total;
      const advance = item.codAdvance ?? item.product.codAdvance ?? 100;
      return total + advance * item.quantity;
    }, 0);
  }, [cartDetails]);

  // Safe side-effect verification to prevent React cascading render errors
  useEffect(() => {
    if (appliedCoupon && couponDiscount === 0 && cartDetails.length > 0) {
      const timer = setTimeout(() => {
        setAppliedCoupon(null);
        toast.info(
          "Coupon removed because the eligible item was removed from cart.",
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [cartDetails.length, appliedCoupon, couponDiscount, setAppliedCoupon]);

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(id);
    updateQuantity(id, newQuantity);
    const res = await updateCartItemQuantity(id, newQuantity);
    if (!res.success) toast.error("Failed to update quantity");
    setIsUpdating(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialogItem === null) return;
    const idToDelete = deleteDialogItem;
    setDeleteDialogItem(null);
    removeItem(idToDelete);
    toast.success("Item removed from cart");
    const res = await removeCartItem(idToDelete);
    if (!res.success) toast.error("Failed to sync deletion");
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

  const handleProceedToBuy = async () => {
    if (isAddressEmpty) {
      setIsCheckoutShaking(true);
      setTimeout(() => setIsCheckoutShaking(false), 500);
      toast.error("Delivery Address Required", {
        description: "Please add your complete address in your profile.",
      });
      return;
    }

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Payment Gateway Error", {
        description: "Failed to load Razorpay.",
      });
      return;
    }

    const amountToPay = paymentMethod === "online" ? finalAmount : totalCodAdvance;
    toast.loading(`Initiating secure payment of ₹${amountToPay}...`, {
      id: "payment",
    });

    const orderRes = await createRazorpayOrderId(amountToPay);
    if (!orderRes.success || !orderRes.orderId) {
      return toast.error("Payment Initialization Failed.", { id: "payment" });
    }

    toast.dismiss("payment");

    const options = {
      key:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id_here",
      amount: amountToPay * 100,
      currency: "INR",
      name: "Big Boy Deals",
      description:
        paymentMethod === "cod" ? "COD Security Deposit" : "Order Payment",
      order_id: orderRes.orderId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (response: any) {
        setIsProcessingPayment(true);
        toast.loading("Verifying payment and confirming order...", {
          id: "confirm",
        });

        const confirmRes = await confirmOrder({
          totalAmount: finalAmount,
          codAdvancePaid:
            paymentMethod === "cod" ? totalCodAdvance : finalAmount,
          paymentMethod: paymentMethod === "online" ? "razorpay" : "cod",
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          shippingAddress: {
            street: user.streetAddress,
            city: user.city,
            state: user.state,
            pin: user.pincode,
          },
          cartDetails: cartDetails,
        });

        if (confirmRes.success) {
          clearCartState([]);
          setAppliedCoupon(null); // Clear global coupon store upon success
          toast.success("Payment Successful! Order Placed.", { id: "confirm" });
          router.push("/order-success");
        } else {
          setIsProcessingPayment(false);
          toast.error("Order recording failed, please contact support.", {
            id: "confirm",
          });
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false);
        },
      },
      prefill: {
        name: user.fullName || "",
        email: user.email || "",
        contact: user.phone || "",
      },
      theme: { color: "#0f172a" },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  if (isProcessingPayment) {
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

  if (!productsLoaded) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-border rounded-md bg-secondary/5 mt-8">
        <ShoppingCart size={48} className="text-muted-foreground/30 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Button
          onClick={() => router.push("/")}
          className="mt-6 h-11 px-8 rounded-md font-bold uppercase tracking-wider"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <>
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
        My Shopping Cart{" "}
        <span className="text-muted-foreground text-lg font-medium ml-2">
          ({cartItems.length} Items)
        </span>
      </h1>
      <Separator className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <CartItemList
            cartDetails={cartDetails}
            isUpdating={isUpdating}
            handleUpdateQuantity={handleUpdateQuantity}
            setDeleteDialogItem={setDeleteDialogItem}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <OrderSummary
            user={user}
            isAddressEmpty={isAddressEmpty}
            subTotal={subTotal}
            totalDiscount={totalDiscount}
            couponDiscount={couponDiscount}
            finalAmount={finalAmount}
            totalCodAdvance={totalCodAdvance}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isCheckoutShaking={isCheckoutShaking}
            handleProceedToBuy={handleProceedToBuy}
            onAddAddressClick={() => router.push("/profile")}
            availableCoupons={availableCoupons}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
          />
        </div>
      </div>

      <AlertDialog
        open={deleteDialogItem !== null}
        onOpenChange={(open) => !open && setDeleteDialogItem(null)}
      >
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Remove Item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this product from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogItem(null)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="rounded-md"
            >
              Yes, Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
