import Link from "next/link";
import { ChevronRight, Truck, MapPin, Clock, PackageCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Shipping & Delivery | Big Boy Deals",
  description:
    "Information regarding our shipping partners, delivery times, and dispatch processes.",
};

export default function ShippingDeliveryPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 md:py-16 animate-in fade-in duration-700">
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">
          Shipping & Delivery
        </span>
      </nav>

      <div className="space-y-4 mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Shipping & Delivery
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          We partner with top logistics providers to ensure your Big Boy Deals
          reach you safely and on time.
        </p>
      </div>

      <Separator className="mb-10" />

      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <Truck className="text-primary" /> Our Partners
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              To provide you with the best reach and fastest delivery, we have
              partnered with multiple trusted logistics and courier services.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Premium Couriers:</strong> We use aggregators like
                Shiprocket to assign the fastest courier (Delhivery, Xpressbees,
                Bluedart, etc.) for your specific pin code.
              </li>
              <li>
                <strong>India Post:</strong> For remote locations where private
                couriers might not be serviceable, we utilize the extensive
                network of the Indian Post Office.
              </li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <Clock className="text-primary" /> Processing Time
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>
              We work hard to get your gear out the door as quickly as possible.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Orders are typically processed and dispatched within{" "}
                <strong>1 to 2 business days</strong>.
              </li>
              <li>
                Orders placed on weekends or public holidays will be processed
                on the next working day.
              </li>
              <li>
                You will receive a confirmation email and SMS with tracking
                details as soon as your order leaves our facility.
              </li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 shrink-0">
            <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <MapPin className="text-primary" /> Delivery Time
            </div>
          </div>
          <div className="md:w-2/3 space-y-4 text-muted-foreground">
            <p>Estimated delivery times vary depending on your location:</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-secondary/20 border border-border p-4 rounded-md">
                <h4 className="font-bold text-foreground">Metro Cities</h4>
                <p className="text-sm mt-1">2 to 4 Business Days</p>
              </div>
              <div className="bg-secondary/20 border border-border p-4 rounded-md">
                <h4 className="font-bold text-foreground">Rest of India</h4>
                <p className="text-sm mt-1">4 to 7 Business Days</p>
              </div>
            </div>
            <p className="text-sm mt-4">
              <em>
                *Please note that unforeseen circumstances like weather
                conditions, strikes, or remote locations may cause slight
                delays.
              </em>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
