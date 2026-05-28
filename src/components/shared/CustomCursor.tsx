"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Touch/Mobile devices pe custom cursor nahi dikhana hai
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    // Event delegation to detect hover on interactive elements smoothly
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, input, textarea, select, [role="button"], label',
        )
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseover", handleMouseOver);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  // Agar mobile hai ya cursor window se bahar hai, toh hide rakho
  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* 1. Main Small Dot (Exact Mouse Position) */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          // Hover hone pe chhota dot gayab ho jata hai clean look ke liye
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.05 }}
      />

      {/* 2. Larger Delayed Circle */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-primary bg-primary/10 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center backdrop-blur-[1px]"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isHovering ? 1.8 : 1,
          backgroundColor: isHovering
            ? "rgba(152, 30, 45, 0.2)"
            : "rgba(152, 30, 45, 0.1)", // Primary color with opacity
          borderColor: isHovering
            ? "rgba(152, 30, 45, 0)"
            : "rgba(152, 30, 45, 0.5)",
        }}
        transition={{
          type: "spring",
          stiffness: 150, // Higher stiffness = follows faster
          damping: 15, // Controls bounciness
          mass: 0.5,
        }}
      />
    </>
  );
}
