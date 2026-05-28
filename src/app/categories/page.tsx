"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getAllCategories } from "@/app/actions/categories";
import { Image as ImageIcon, ChevronRight } from "lucide-react";

export default function AllCategoriesPage() {
  const { categories, isLoaded, setCategories } = useCategoryStore();

  useEffect(() => {
    const fetchCats = async () => {
      if (!isLoaded) {
        const data = await getAllCategories();
        setCategories(data);
      }
    };
    fetchCats();
  }, [isLoaded, setCategories]);

  if (!isLoaded) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="h-10 w-48 bg-secondary rounded-md mb-4" />
        <div className="h-4 w-96 bg-secondary rounded-md mb-8" />
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-6">
              <div className="h-8 w-32 bg-secondary rounded-md" />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="aspect-square md:h-[160px] md:aspect-auto bg-secondary rounded-full md:rounded-md"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const primaryCategories = categories.filter((c) => c.parentId === null);

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">All Categories</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          All Categories
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
          Explore our complete collection organized by style and purpose. Find
          exactly what you are looking for across our diverse range of premium
          products.
        </p>
      </div>

      <Separator className="mb-12" />

      {/* Categories Content */}
      <div className="space-y-16">
        {primaryCategories.length === 0 ? (
          <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              No categories available at the moment.
            </p>
          </div>
        ) : (
          primaryCategories.map((primary) => {
            const subCategories = categories.filter(
              (c) => c.parentId === primary.id,
            );

            return (
              <section key={primary.id} className="space-y-8">
                {/* Primary Category Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    {primary.name}
                  </h2>
                  <Link
                    href={`/category/${primary.slug}`}
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    View All {primary.name}
                  </Link>
                </div>

                {/* Sub-categories Grid */}
                {subCategories.length === 0 ? (
                  <div className="py-10 px-6 bg-secondary/5 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground">
                      No sub-sections added under this category yet.
                    </p>
                  </div>
                ) : (
                  /* Mobile pe grid-cols-3, PC pe grid-cols-3/4 */
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {subCategories.map((sub) => (
                      <motion.div
                        key={sub.id}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center md:block" // Mobile center align
                      >
                        <Link
                          href={`/category/${primary.slug}/${sub.slug}`}
                          className="group block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                        >
                          {/* Image Container: Circle on Mobile, Rectangle on PC */}
                          <div className="relative mx-auto w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-full md:h-[160px] overflow-hidden rounded-full md:rounded-md bg-secondary/20 border border-border shadow-sm group-hover:shadow-md transition-all">
                            {sub.imageUrl ? (
                              <Image
                                src={sub.imageUrl}
                                alt={sub.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-gray-100 dark:bg-secondary">
                                <ImageIcon size={32} />
                              </div>
                            )}

                            {/* Whitish Glassmorphism Tag - Desktop Only */}
                            <div className="absolute bottom-3 left-3 hidden md:block w-fit bg-white/20 backdrop-blur-md border border-white/30 shadow-sm rounded-md px-3 py-1.5 group-hover:bg-white/30 transition-colors">
                              <span className="font-semibold text-sm tracking-wide text-white drop-shadow-md">
                                {sub.name}
                              </span>
                            </div>
                          </div>

                          {/* Name Tag - Mobile Only (Below the circle) */}
                          <div className="mt-2 text-center md:hidden w-full">
                            <span className="text-xs font-medium truncate px-1 text-foreground/80 block">
                              {sub.name}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
