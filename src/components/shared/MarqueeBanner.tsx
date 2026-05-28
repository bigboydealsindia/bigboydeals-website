"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface MarqueeBannerProps {
  items: string[];
}

export function MarqueeBanner({ items }: MarqueeBannerProps) {
  if (!items || items.length === 0) return null;

  // Seamless loop ke liye array ko 20 times multiply kiya hai
  const repeatedItems = Array(20).fill(items).flat();

  return (
    <div className="w-full bg-primary text-primary-foreground overflow-hidden py-2.5 flex items-center border-b border-primary/20">
      <motion.div
        className="flex whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 120, // Yahan bada number dalein (jaise 80, 100, ya 120) slow speed ke liye
        }}
      >
        {repeatedItems.map((text, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 px-4 text-sm font-medium tracking-wide"
          >
            <span>{text}</span>
            <Sparkles size={14} className="opacity-70" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
