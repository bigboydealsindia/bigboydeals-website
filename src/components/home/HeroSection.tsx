"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroStore } from "@/store/useHeroStore";
import { getStoreSettings } from "@/app/actions/settings";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSection() {
  const { banners, video, isLoaded, setHeroData } = useHeroStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch data if accessed directly on frontend
  useEffect(() => {
    const fetchHeroData = async () => {
      if (!isLoaded) {
        const settings = await getStoreSettings();
        setHeroData(settings.heroBanners || [], settings.heroVideo || null);
      }
    };
    fetchHeroData();
  }, [isLoaded, setHeroData]);

  // Auto-slide logic
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex gap-4 h-[300px] md:h-[500px]">
        <Skeleton className="flex-[3] h-full rounded-[var(--radius)]" />
        <Skeleton className="flex-[1] h-full rounded-[var(--radius)] hidden md:block" />
      </div>
    );
  }

  // If completely empty, don't render the section
  if (banners.length === 0 && !video) return null;

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col md:flex-row gap-4 h-[300px] sm:h-[400px] md:h-[500px]">
        {/* Banner Slider Container (80% Area) */}
        {banners.length > 0 && (
          <div className="flex-[3] relative rounded-[var(--radius)] overflow-hidden bg-secondary/20 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Link
                  href={`/${banners[currentIndex].path}`}
                  className="w-full h-full block"
                >
                  <Image
                    src={banners[currentIndex].fileUrl}
                    alt={`Hero Banner ${currentIndex + 1}`}
                    fill
                    priority
                    className="object-cover w-full h-full"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots Indicator */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-primary" : "w-2 bg-white/60 hover:bg-white"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video Reel Container (20% Area) */}
        {video && (
          <Link
            href={`/${video.path}`}
            className="flex-[1] relative rounded-[var(--radius)] overflow-hidden bg-black group hidden md:block"
          >
            <video
              src={video.fileUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
        )}
      </div>

      {/* Mobile Video Display (Stacks below on small screens) */}
      {video && (
        <Link
          href={`/${video.path}`}
          className="mt-4 w-full h-[400px] relative rounded-[var(--radius)] overflow-hidden bg-black block md:hidden"
        >
          <video
            src={video.fileUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </Link>
      )}
    </section>
  );
}
