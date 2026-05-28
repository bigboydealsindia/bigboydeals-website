"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CircleAlert,
  CreditCard,
  Banknote,
  TicketPercent,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface OrderSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  isAddressEmpty: boolean;
  subTotal: number;
  totalDiscount: number;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: "online" | "cod";
  setPaymentMethod: (method: "online" | "cod") => void;
  isCheckoutShaking: boolean;
  handleProceedToBuy: () => void;
  onAddAddressClick: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableCoupons: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appliedCoupon: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAppliedCoupon: (coupon: any | null) => void;
}

export function OrderSummary({
  user,
  isAddressEmpty,
  subTotal,
  totalDiscount,
  couponDiscount,
  finalAmount,
  paymentMethod,
  setPaymentMethod,
  isCheckoutShaking,
  handleProceedToBuy,
  onAddAddressClick,
  availableCoupons,
  appliedCoupon,
  setAppliedCoupon,
}: OrderSummaryProps) {
  const [couponCodeInput, setCouponCodeInput] = useState("");

  const checkoutShakeVariants: Variants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    idle: { x: 0 },
  };

  const handleApplyCoupon = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;

    const matchedCoupon = availableCoupons.find((c) => c.code === code);

    if (!matchedCoupon) {
      toast.error("Invalid Coupon", {
        description:
          "This coupon code does not exist or is not applicable to your cart.",
      });
      return;
    }

    setAppliedCoupon(matchedCoupon);
    setCouponCodeInput("");
    toast.success("Coupon Applied!", {
      description: `You got extra discount with ${code}`,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon Removed");
  };

  return (
    <div className="flex flex-col gap-6 sticky top-24">
      <div className="bg-background border border-border rounded-md p-5 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <User size={18} className="text-primary" /> Delivery Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User size={16} className="text-muted-foreground mt-0.5" />
            <p className="text-sm font-medium text-foreground">
              {user.fullName || "User"}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-muted-foreground mt-0.5" />
            <p className="text-sm font-medium text-foreground">{user.email}</p>
          </div>
          {user.phone && (
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-muted-foreground mt-0.5" />
              <p className="text-sm font-medium text-foreground">
                {user.phone}
              </p>
            </div>
          )}

          {isAddressEmpty ? (
            <div className="flex flex-col items-start gap-2 pt-3 mt-3 border-t border-border/50">
              <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-tight">
                  We need your delivery address to process this order.
                </p>
              </div>
              <Button
                onClick={onAddAddressClick}
                variant="outline"
                size="sm"
                className="mt-1 rounded-md border-amber-500 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 w-full"
              >
                Add Address First
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3 pt-3 mt-3 border-t border-border/50">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {user.streetAddress}, {user.city}, <br />
                {user.state} - {user.pincode}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border border-border rounded-md p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-5 uppercase tracking-wider">
          Order Summary
        </h3>

        <div className="mb-6 space-y-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <TicketPercent
                  size={18}
                  className="text-green-600 dark:text-green-500"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-green-700 dark:text-green-400 text-sm">
                    {appliedCoupon.code} Applied
                  </span>
                  <span className="text-[10px] font-medium text-green-600/80 dark:text-green-500/80">
                    You saved ₹{couponDiscount.toLocaleString("en-IN")} extra!
                  </span>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
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
                  onClick={() => handleApplyCoupon(couponCodeInput)}
                  disabled={!couponCodeInput.trim()}
                  className="h-10 font-bold px-5 rounded-md shrink-0"
                >
                  Apply
                </Button>
              </div>

              {availableCoupons.length > 0 && (
                <div className="space-y-2 mt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Available Coupons
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        onClick={() => handleApplyCoupon(coupon.code)}
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

        <Separator className="mb-4" />

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Total MRP</span>
            <span className="font-bold text-foreground">
              ₹{(subTotal + totalDiscount).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              Discount on MRP
            </span>
            <span className="font-bold text-green-600 dark:text-green-500">
              -₹{totalDiscount.toLocaleString("en-IN")}
            </span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-sm animate-in slide-in-from-right-4">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <TicketPercent size={14} className="text-primary" /> Coupon
                Discount
              </span>
              <span className="font-bold text-primary">
                -₹{couponDiscount.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              Shipping Fee
            </span>
            <span className="font-bold text-primary">FREE</span>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="flex justify-between items-center mb-6">
          <span className="text-base font-bold text-foreground">
            Total Amount
          </span>
          <span className="text-2xl font-black text-foreground">
            ₹{finalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2.5 rounded-md text-xs font-bold mb-6">
          <CircleAlert size={16} className="shrink-0" />
          <span>Inclusive of all taxes. Est. delivery: 5 - 7 Days</span>
        </div>

        <div className="space-y-3 mb-6">
          <div
            onClick={() => setPaymentMethod("online")}
            className={`relative flex items-center justify-between p-4 rounded-md border-2 cursor-pointer transition-all ${
              paymentMethod === "online"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-primary/50"
            }`}
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
                <span className="font-bold text-foreground text-sm">
                  Pay Online
                </span>
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
            className={`relative flex items-center justify-between p-4 rounded-md border-2 cursor-pointer transition-all ${
              paymentMethod === "cod"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-primary/50"
            }`}
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
                <span className="font-bold text-foreground text-sm">
                  Cash on Delivery
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Pay cash upon receiving (₹100 online advance)
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

        <motion.div
          animate={isCheckoutShaking ? "shake" : "idle"}
          variants={checkoutShakeVariants}
        >
          <Button
            onClick={handleProceedToBuy}
            className="w-full h-12 rounded-md font-bold text-sm sm:text-base uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            {paymentMethod === "online"
              ? `Pay ₹${finalAmount.toLocaleString("en-IN")}`
              : "Pay ₹100 Advance"}
          </Button>
        </motion.div>

        <p className="text-[10px] text-center text-muted-foreground font-medium mt-4">
          Safe and secure payments. Easy returns.
        </p>
      </div>
    </div>
  );
}
