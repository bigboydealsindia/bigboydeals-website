import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfettiFireworks } from "@/components/shared/ConfettiFireworks";

export const metadata = {
  title: "Order Confirmed | Big Boy Deals",
};

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-secondary/5">
      <ConfettiFireworks />

      <div className="max-w-lg w-full bg-background border border-border rounded-2xl p-8 md:p-12 text-center shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2
            size={40}
            className="text-green-600 dark:text-green-500"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Order Confirmed!
        </h1>

        <p className="text-base font-medium text-muted-foreground mb-10 leading-relaxed">
          Thank you for shopping with Big Boy Deals. Your order has been
          successfully placed and is now being processed. We'll send you an
          email with the tracking details shortly.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Button
            asChild
            className="h-12 w-full rounded-md font-bold text-base gap-2 shadow-md"
          >
            <Link href="/orders">
              <Package size={18} /> View My Orders
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-md font-bold text-base gap-2 border-border hover:bg-secondary transition-colors"
          >
            <Link href="/">
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
