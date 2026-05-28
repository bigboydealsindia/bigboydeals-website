"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Image as ImageIcon } from "lucide-react";

export function CategorySection() {
  const { categories, isLoaded } = useCategoryStore();
  const [activeTab, setActiveTab] = useState<number | "All">("All");

  if (!isLoaded || categories.length === 0) return null;

  const primaryCategories = categories.filter((c) => c.parentId === null);

  const displayCategories =
    activeTab === "All"
      ? primaryCategories
      : categories.filter((c) => c.id === activeTab);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight">
            Browse by Category
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          <button
            onClick={() => setActiveTab("All")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            All
          </button>
          {primaryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Layout */}
      <div className="flex overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 gap-3 md:gap-6 md:flex-wrap snap-x snap-mandatory md:snap-none">
        <AnimatePresence mode="popLayout">
          {displayCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-md"
            >
              No categories found in this section.
            </motion.div>
          ) : (
            displayCategories.map((cat, idx) => {
              // SMART LOGIC FOR NESTED ROUTING
              const parentCat = cat.parentId
                ? categories.find((p) => p.id === cat.parentId)
                : null;
              const categoryHref = parentCat
                ? `/category/${parentCat.slug}/${cat.slug}`
                : `/category/${cat.slug}`;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  key={cat.id}
                  className="shrink-0 flex flex-col items-center md:block snap-start"
                >
                  <Link
                    href={categoryHref}
                    className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                  >
                    {/* FIX: Mobile pe small square (40vw), Desktop pe rectangle (280px x 160px) */}
                    <div className="relative overflow-hidden bg-secondary/30 transition-all duration-300 w-[40vw] h-[40vw] sm:w-[200px] sm:h-[200px] md:w-[280px] md:h-[160px] rounded-md border border-border shadow-sm md:group-hover:shadow-md md:group-hover:-translate-y-1">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-gray-100 dark:bg-secondary">
                          <ImageIcon
                            size={32}
                            className="md:w-8 md:h-8 w-6 h-6"
                          />
                        </div>
                      )}

                      {/* Whitish Glassmorphism Tag - Adjusted padding for mobile */}
                      <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 w-fit bg-white/20 backdrop-blur-md border border-white/30 shadow-sm rounded-md px-2 py-1 md:px-3 md:py-1.5 transition-colors duration-300 group-hover:bg-white/30 max-w-[85%]">
                        <span className="font-semibold text-xs md:text-sm tracking-wide text-white drop-shadow-md line-clamp-1">
                          {cat.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
