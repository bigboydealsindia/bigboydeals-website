import Link from "next/link";
import { ChevronRight, Lock, Eye, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const revalidate = 86400; // ISR: Revalidate every 24 hours (static content)

export const metadata = {
  title: "Privacy Policy | Big Boy Deals",
  description: "How we collect, use, and protect your data at Big Boy Deals.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 md:py-16 animate-in fade-in duration-700">
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">Privacy Policy</span>
      </nav>

      <div className="space-y-4 mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          At Big Boy Deals (bigboydeals.com), we value your trust and respect
          your privacy. Here is how we handle your data.
        </p>
      </div>

      <Separator className="mb-10" />

      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <Eye className="text-primary" /> Data We Collect
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              When you visit our website or make a purchase, we collect certain
              information to provide you with the best experience:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Personal Info:</strong> Name, email address, phone
                number, and shipping address.
              </li>
              <li>
                <strong>Payment Info:</strong> All online payments are securely
                processed via Razorpay. We do not store your credit card or UPI
                details on our servers.
              </li>
              <li>
                <strong>Usage Data:</strong> Device type, IP address, and
                browsing behavior to improve our website's UI/UX.
              </li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <Lock className="text-primary" /> How We Use Data
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              Your data is strictly used for operational and service purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                To process and fulfill your orders, and generate invoices.
              </li>
              <li>
                To provide shipping updates via our logistics partners (e.g.,
                Shiprocket).
              </li>
              <li>
                To send important account updates or promotional offers (only if
                you subscribe).
              </li>
              <li>To respond to your customer support queries.</li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <ShieldAlert className="text-primary" /> Data Protection
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              We implement a variety of security measures to maintain the safety
              of your personal information. We use secure servers, and all
              supplied sensitive/credit information is transmitted via Secure
              Socket Layer (SSL) technology and encrypted into our Payment
              gateway providers database only to be accessible by those
              authorized with special access rights.
            </p>
            <p className="font-bold text-foreground mt-4">
              We do NOT sell, trade, or otherwise transfer your personally
              identifiable information to outside parties.
            </p>
          </div>
        </section>

        <div className="bg-secondary/20 p-6 rounded-md border border-border text-center mt-8">
          <p className="text-foreground font-medium mb-2">
            Have questions about your data?
          </p>
          <p className="text-muted-foreground text-sm">
            Contact our privacy team at{" "}
            <a
              href="mailto:support@bigboydeals.com"
              className="text-primary hover:underline font-bold"
            >
              support@bigboydeals.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
