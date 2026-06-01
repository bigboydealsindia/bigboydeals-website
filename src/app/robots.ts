// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Replace with your actual live domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bigboydeals.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // In folders/pages ko Google search se hide karna hai
      disallow: [
        "/admin/",
        "/admin/*",
        "/account/",
        "/account/*",
        "/cart/",
        "/checkout/",
        "/wishlist/",
        "/login/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
