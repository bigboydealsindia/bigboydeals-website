import Link from "next/link";
import {
  ChevronRight,
  RefreshCcw,
  ShieldCheck,
  Truck,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Return & Refund Policy | Big Boy Deals",
  description:
    "Learn about our simple and hassle-free 7-day return and refund policy.",
};

export default function ReturnRefundPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 md:py-16 animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">Return & Refund</span>
      </nav>

      <div className="space-y-4 mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Return and Refund Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          We want you to love what you ordered. If something is not right, let
          us know. We offer a hassle-free 7-Day Return Policy.
        </p>
      </div>

      <Separator className="mb-10" />

      <div className="space-y-12">
        {/* Section 1 */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <ShieldCheck className="text-primary" /> Eligibility
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              To ensure a smooth return process, please make sure that the item
              meets the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The product must be unused, unwashed, and undamaged.</li>
              <li>All original tags and packaging must be intact.</li>
              <li>The receipt or proof of purchase should be available.</li>
            </ul>
            <div className="bg-secondary/30 p-4 rounded-md border border-border mt-4 flex gap-3 items-start">
              <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-foreground">
                We reserve the right to reject a return if the product shows
                signs of wear or damage caused by the customer.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 2 */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <RefreshCcw className="text-primary" /> How to Initiate
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              We have kept the process simple. You don't need to navigate
              complex portals. Just reach out to us, and we will handle the
              rest.
            </p>
            <div className="space-y-6 mt-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Contact Us</h4>
                  <p className="text-sm mt-1">
                    Send us a message via our Contact Page, Email (
                    <a
                      href="mailto:support@bigboydeals.com"
                      className="text-primary hover:underline"
                    >
                      support@bigboydeals.com
                    </a>
                    ), or WhatsApp. Mention your Order ID and the reason for
                    return.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-foreground">
                    Pickup Scheduling
                  </h4>
                  <p className="text-sm mt-1">
                    Once approved, we will arrange a reverse pickup via our
                    logistics partners (like Delhivery or Shiprocket) within 2-3
                    business days.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Handover</h4>
                  <p className="text-sm mt-1">
                    Please pack the item securely and hand it over to the
                    courier person.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 3 */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <CreditCard className="text-primary" /> Refund Process
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              Once the returned item reaches our warehouse, our quality team
              will inspect it. If everything looks good, we will initiate your
              refund.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-background border border-border p-5 rounded-[var(--radius)] shadow-sm">
                <h4 className="font-bold text-foreground mb-2">
                  Prepaid Orders (Razorpay)
                </h4>
                <p className="text-sm">
                  The amount will be refunded to your original payment source
                  (Credit Card, Debit Card, or UPI) within 5-7 business days.
                </p>
              </div>
              <div className="bg-background border border-border p-5 rounded-[var(--radius)] shadow-sm">
                <h4 className="font-bold text-foreground mb-2">
                  Cash on Delivery (COD)
                </h4>
                <p className="text-sm">
                  Since we cannot refund cash, we will transfer the amount to
                  your Bank Account or UPI ID. Our team will ask for these
                  details once the return is approved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 4 */}
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <Truck className="text-primary" /> Exchanges & Damages
            </div>
          </div>
          <div className="md:w-2/3 space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-bold text-foreground text-lg mb-2">
                Exchanges
              </h4>
              <p>
                If you received a size that doesn't fit, we recommend initiating
                a return and placing a new order for the correct size. This
                ensures you get the new product faster without waiting for the
                exchange process to complete.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-lg mb-2">
                Damaged or Wrong Product
              </h4>
              <p>
                In the rare case that you receive a damaged or incorrect
                product, please notify us within{" "}
                <strong>48 hours of delivery</strong>. We will arrange an
                immediate replacement or a full refund at no extra cost to you.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
