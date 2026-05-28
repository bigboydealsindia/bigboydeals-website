"use client";

import { useState } from "react";
import Image from "next/image";
import { TrendingUp } from "lucide-react"; // NAYA IMPORT

interface ProductImageGalleryProps {
  mainImage: string;
  galleryImages: string[];
  productName: string;
  discount: number;
  isMostSelling?: boolean; // NAYA PROP
}

export function ProductImageGallery({
  mainImage,
  galleryImages,
  productName,
  discount,
  isMostSelling, // PROP RECEIVED
}: ProductImageGalleryProps) {
  const allImages = [mainImage, ...galleryImages].filter(Boolean);
  const [activeImage, setActiveImage] = useState(allImages[0] || mainImage);

  return (
    <div className="space-y-4">
      {/* Main Large Image Box */}
      <div className="relative w-full aspect-[4/5] bg-secondary/10 rounded-md overflow-hidden border border-border/50">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          className="object-cover transition-all duration-300"
        />

        {/* NAYA: Most Selling Tag at Top Right */}
        {isMostSelling && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-950 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-sm shadow-sm flex items-center gap-1 uppercase tracking-wider z-10">
            <TrendingUp size={12} /> Most Selling
          </div>
        )}
      </div>

      {/* Small Additional Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-20 aspect-[4/5] bg-secondary/10 rounded-md overflow-hidden border transition-all ${
                activeImage === img
                  ? "border-primary ring-2 ring-primary/20 scale-95"
                  : "border-border/60 hover:border-border-muted"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} view ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
