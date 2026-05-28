"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoaderComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // NAYA LOGIC: By default isko 'true' rakha hai taaki website open hote hi loader dikhe
  const [isLoading, setIsLoading] = useState(true);

  // URL change hote hi ya initial load ke baad loader ko hide karne ka logic
  useEffect(() => {
    // 800ms ka delay diya hai taaki background mein database ka data fetch aur render ho jaye
    // Aap is time ko 800 (0.8s) ya 1000 (1s) apne hisaab se adjust kar sakte hain
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Har Link click ko intercept karo aur video dikhao
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor || !anchor.href) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // Ignore new tabs
      if (anchor.target === "_blank") return;

      const targetUrl = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);

      // Agar same page ka hash link hai toh loader mat dikhao
      if (
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search
      ) {
        return;
      }

      setIsLoading(true);
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out"
      style={{ backgroundColor: "#FBF9F7" }}
    >
      <div className="relative w-32 h-32 flex items-center justify-center">
        <video
          src="/loading.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

// Suspense wrap zaroori hai taaki Next.js build mein error na de
export function RouteLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderComponent />
    </Suspense>
  );
}
