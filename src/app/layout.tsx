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

export const metadata: Metadata = {
  title: "BigBoyDeals | Premium E-Commerce",
  description: "Your one-stop shop for the best deals.",
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
