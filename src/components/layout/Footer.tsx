import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { categories, storeSettings } from "@/db/schema";
import { MapPin, Phone, Mail, Heart, ShieldCheck } from "lucide-react";

export async function Footer() {
  // 1. Fetch categories and store settings data in parallel
  const [allCategories, settingsData] = await Promise.all([
    db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    }),
    db.select().from(storeSettings).limit(1),
  ]);

  const mainCategories = allCategories.filter((c) => !c.parentId);

  // Default values if admin has not configured contact info yet
  const defaultContactInfo = {
    address: "123 Fashion Street, Sector 4, New Delhi, India - 110001",
    email: "support@bigboydeals.com",
    additionalEmail: "",
    phone: "+91 98765 43210",
    additionalPhone: "",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754720611!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    socials: {
      facebook: "",
      instagram: "",
      youtube: "",
      twitter: "",
      threads: "",
      linkedin: "",
      url: "",
    },
  };

  const info = settingsData[0]?.contactInfo || defaultContactInfo;

  // Helper function to safely format external destination links
  const formatExternalLink = (url: string) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  return (
    <footer className="bg-secondary/10 border-t border-border mt-auto w-full">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 pt-12 pb-6">
        {/* Top Section: 4 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Column 1: Brand Info & Social Networks */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                <Image
                  src="/placeholder-logo.png"
                  alt="Big Boy Deals Logo"
                  fill
                  className="object-cover bg-secondary"
                />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Big Boy Deals
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate destination for premium quality fashion and
              lifestyle products. We deliver style, comfort, and unmatched value
              right to your doorstep.
            </p>

            {/* Conditional Social Media Container */}
            {info.socials &&
              Object.values(info.socials).some(
                (url) => url && url.trim() !== "",
              ) && (
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {info.socials.facebook && (
                    <Link
                      href={formatExternalLink(info.socials.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </Link>
                  )}
                  {info.socials.instagram && (
                    <Link
                      href={formatExternalLink(info.socials.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        ></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </Link>
                  )}
                  {info.socials.twitter && (
                    <Link
                      href={formatExternalLink(info.socials.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </Link>
                  )}
                  {info.socials.youtube && (
                    <Link
                      href={formatExternalLink(info.socials.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                      </svg>
                    </Link>
                  )}
                  {info.socials.threads && (
                    <Link
                      href={formatExternalLink(info.socials.threads)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M14.5 11.5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5c.78 0 1.47-.36 1.93-.92.35.43.88.72 1.48.72 1.1 0 2-1.01 2-2.25v-.55c0-2.48-1.79-4.5-4-4.5s-4 2.02-4 4.5 1.79 4.5 4 4.5c1.06 0 2.03-.47 2.7-1.22" />
                      </svg>
                    </Link>
                  )}
                  {info.socials.linkedin && (
                    <Link
                      href={formatExternalLink(info.socials.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </Link>
                  )}
                  {info.socials.url && (
                    <Link
                      href={formatExternalLink(info.socials.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </Link>
                  )}
                </div>
              )}
          </div>

          {/* Column 2: Shop (Nested Dynamic Categories) */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-foreground">
              Shop
            </h3>
            <ul className="space-y-4">
              {mainCategories.map((mainCat) => {
                const subCats = allCategories.filter(
                  (c) => c.parentId === mainCat.id,
                );
                return (
                  <li key={mainCat.id} className="text-sm">
                    <Link
                      href={`/category/${mainCat.slug}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {mainCat.name}
                    </Link>
                    {subCats.length > 0 && (
                      <ul className="ml-3 mt-2 space-y-2 border-l-2 border-secondary/50 pl-3">
                        {subCats.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${mainCat.slug}/${sub.slug}`}
                              className="text-muted-foreground hover:text-primary transition-colors block"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Policy & Help */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-foreground">
              Policy and Help
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/return-refund"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-delivery"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Reach Us */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-foreground">
              Reach Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={18} className="shrink-0 text-primary mt-0.5" />
                <span>{info.address}</span>
              </li>

              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail size={18} className="shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span>{info.email}</span>
                  {info.additionalEmail && (
                    <span className="border-t border-border/30 pt-1 mt-0.5">
                      {info.additionalEmail}
                    </span>
                  )}
                </div>
              </li>

              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone size={18} className="shrink-0 text-primary mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span>{info.phone}</span>
                  {info.additionalPhone && (
                    <span className="border-t border-border/30 pt-1 mt-0.5">
                      {info.additionalPhone}
                    </span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Wide Map Section with Grayscale to Color Animation */}
        {info.mapSrc && (
          <div className="group w-full h-48 md:h-64 rounded-xl overflow-hidden border border-border bg-secondary/20 relative shadow-inner mb-8">
            <iframe
              src={info.mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
            ></iframe>
          </div>
        )}

        <div className="h-px w-full bg-border mb-6" />

        {/* Bottom Bar: Copyright, Payment, and Credit */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright */}
          <div className="text-muted-foreground font-medium order-3 lg:order-1 text-center lg:text-left">
            © {new Date().getFullYear()} Big Boy Deals. All rights reserved.
          </div>

          {/* Payment Info */}
          <div className="flex items-center gap-2 text-muted-foreground order-2 font-medium bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
            <ShieldCheck size={14} className="text-green-600" />
            <span>100% Secure Payment:</span>
            <span className="font-bold text-foreground">
              VISA, MasterCard, UPI
            </span>
            <span className="text-blue-600 font-bold ml-1 border-l pl-2 border-border">
              Razorpay
            </span>
          </div>

          {/* Dgisight Credit Link */}
          <Link
            href="https://dgisight.oxzeen.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-secondary/50 hover:bg-secondary border border-border/50 px-3 py-2 rounded-md transition-colors order-1 lg:order-3 shadow-sm text-foreground group"
          >
            Built with love
            <Heart
              size={12}
              className="text-destructive fill-destructive animate-pulse"
            />
            by{" "}
            <span className="font-bold group-hover:text-primary transition-colors">
              Dgisight
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
