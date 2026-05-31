import Link from "next/link";
import { ChevronRight, Scale, FileText, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Terms & Conditions | Big Boy Deals",
  description: "Terms of service and user agreements for Big Boy Deals.",
};

export default function TermsConditionsPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 md:py-16 animate-in fade-in duration-700">
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">
          Terms & Conditions
        </span>
      </nav>

      <div className="space-y-4 mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Terms & Conditions
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Welcome to Big Boy Deals. By accessing or using bigboydeals.com, you
          agree to be bound by the following terms.
        </p>
      </div>

      <Separator className="mb-10" />

      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <FileText className="text-primary" /> General Use
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              By visiting our site and/or purchasing something from us, you
              engage in our "Service" and agree to be bound by the following
              terms and conditions. These Terms apply to all users of the site,
              including browsers, vendors, customers, and merchants.
            </p>
            <p>
              You must be at least the age of majority in your state or province
              of residence to use this website and make purchases.
            </p>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <Scale className="text-primary" /> Pricing & Products
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Prices for our products are subject to change without notice.
              </li>
              <li>
                We reserve the right to modify or discontinue the Service (or
                any part or content thereof) without notice at any time.
              </li>
              <li>
                Certain products or services may be available exclusively
                online. These products may have limited quantities and are
                subject to our Return Policy.
              </li>
              <li>
                We have made every effort to display as accurately as possible
                the colors and images of our products. However, monitor displays
                may vary.
              </li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <AlertTriangle className="text-primary" /> Account Integrity
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              You agree to provide current, complete, and accurate purchase and
              account information for all purchases made at our store. You agree
              to promptly update your account and other information, including
              your email address, so that we can complete your transactions and
              contact you as needed.
            </p>
            <p>
              We reserve the right to refuse any order you place with us. We
              may, in our sole discretion, limit or cancel quantities purchased
              per person, per household, or per order.
            </p>
          </div>
        </section>

        <div className="bg-secondary/20 p-6 rounded-md border border-border text-center mt-8">
          <p className="text-muted-foreground text-sm">
            For any inquiries regarding our Terms of Service, please contact us
            at{" "}
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
