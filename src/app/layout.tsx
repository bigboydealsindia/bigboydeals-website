import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { RouteLoader } from "@/components/shared/RouteLoader";
import { CustomCursor } from "@/components/shared/CustomCursor";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// FULLY SEO OPTIMIZED METADATA
export const metadata: Metadata = {
  metadataBase: new URL("https://bigboydeals.com"), // Aapka live domain
  title: "Big Boy Deals | Premium E-Commerce Store",
  description:
    "Your ultimate destination for premium quality fashion and lifestyle products. We deliver style, comfort, and unmatched value right to your doorstep.",
  keywords: [
    "Big Boy Deals",
    "Premium Fashion",
    "Mens Clothing",
    "E-commerce",
    "Best Deals India",
    "Streetwear",
    "Sneakers",
  ],
  authors: [{ name: "Big Boy Deals Team" }],
  creator: "Big Boy Deals",
  publisher: "Big Boy Deals",

  // Favicon and App Icons
  icons: {
    icon: "./favicon.ico", // public folder se automatically pick karega
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Agar apple icon ho toh
  },

  // Open Graph (For WhatsApp, Facebook, LinkedIn previews)
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bigboydeals.com",
    title: "Big Boy Deals | Premium E-Commerce",
    description:
      "Your ultimate destination for premium quality fashion and lifestyle products.",
    siteName: "Big Boy Deals",
    images: [
      {
        url: "/og-image.webp", // public folder se 1200x630 image pick karega
        width: 1200,
        height: 630,
        alt: "Big Boy Deals Official Banner",
      },
    ],
  },

  // Twitter Cards (For Twitter/X previews)
  twitter: {
    card: "summary_large_image",
    title: "Big Boy Deals | Premium E-Commerce",
    description:
      "Your ultimate destination for premium quality fashion and lifestyle products.",
    images: ["/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-background text-foreground flex flex-col min-h-screen pb-24 lg:pb-0">
        <CustomCursor />

        <RouteLoader />

        <Navbar />

        {/* Main content wrapper to push footer to the bottom */}
        <main className="flex-1">{children}</main>

        <FooterWrapper>
          <Footer />
        </FooterWrapper>

        <Toaster position="top-right" richColors expand={false} />
      </body>
    </html>
  );
}
