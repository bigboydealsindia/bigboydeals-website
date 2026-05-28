"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {paths.map((path, index) => {
        const href = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;
        // Basic capitalization
        const title = path.charAt(0).toUpperCase() + path.slice(1);

        return (
          <div key={href} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight size={14} />}
            {isLast ? (
              <span className="text-primary font-semibold">{title}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-primary transition-colors"
              >
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
