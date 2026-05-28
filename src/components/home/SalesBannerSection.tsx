"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getStoreSettings } from "@/app/actions/settings";
import { useSalesBannerStore } from "@/store/useSalesBannerStore";

export function SalesBannerSection() {
  const { banners, isLoaded, setBanners } = useSalesBannerStore();
  const [isFetching, setIsFetching] = useState(true);

  // Auto-scroll References & State
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!isLoaded) {
        const settings = await getStoreSettings();
        setBanners(settings.salesBanners || []);
      }
      setIsFetching(false);
    };
    fetchBanners();
  }, [isLoaded, setBanners]);

  // Auto-scrolling Logic
  useEffect(() => {
    // Agar banners 1 ya usse kam hain, ya user interact kar raha hai, toh auto-scroll roko
    if (banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;

        // Agar list ke end par pohoch gaye, wapas zero par smooth scroll karo
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Ek card aur uske gap (16px) jitna aage scroll karo
          const firstChild = scrollRef.current.children[0] as HTMLElement;
          const itemWidth = firstChild ? firstChild.offsetWidth + 16 : 0;
          scrollRef.current.scrollBy({ left: itemWidth, behavior: "smooth" });
        }
      }
    }, 3500); // Har 3.5 seconds mein scroll hoga

    return () => clearInterval(interval);
  }, [banners.length, isHovered]);

  if (isFetching) return null;
  if (banners.length === 0) return null;

  return (
    <section className="py-10 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
        {/* Consistent Heading UI */}
        <h2 className="text-foreground text-2xl md:text-3xl font-medium tracking-tight mb-6">
          Our Sales Offers
        </h2>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {banners.map((banner) => {
            // Strict URL path mapping ensuring no double slashes
            const targetPath = banner.path
              ? `/${banner.path.replace(/^\//, "")}`
              : "/";

            return (
              <Link
                key={banner.id}
                href={targetPath}
                className="snap-start shrink-0 w-[85%] sm:w-[45%] md:w-[35%] lg:w-[25%] aspect-[3/4] relative rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all border border-border"
              >
                <Image
                  src={banner.fileUrl}
                  alt="Sales Offer Promotional Banner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, 25vw"
                  priority={true}
                />

                {/* Subtle dark gradient overlay on hover for better UX */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
