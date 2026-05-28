"use client";

import { usePathname } from "next/navigation";

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide footer on admin panel and login page
  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return <>{children}</>;
}
