import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { LatestProductsSection } from "@/components/home/LatestProductsSection";
import { BestDealsSection } from "@/components/home/BestDealsSection";
import { SalesBannerSection } from "@/components/home/SalesBannerSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <HeroSection />

      <CategorySection />

      <LatestProductsSection />

      <BestDealsSection />

      <SalesBannerSection />

      <ProductSection />

      <NewsletterSection />
    </main>
  );
}
