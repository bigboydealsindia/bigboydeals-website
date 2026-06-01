// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { db } from "@/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bigboydeals.com";

  // 1. Static Pages
  const staticPages = [
    "",
    "/all-products",
    "/categories",
    "/about-us",
    "/contact-us",
    "/privacy-policy",
    "/terms-conditions",
    "/return-refund",
    "/shipping-delivery",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Dynamic Product Pages
  const products = await db.query.products.findMany({
    columns: { slug: true, createdAt: true },
  });

  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.createdAt,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // 3. Dynamic Category Pages (Primary Categories)
  const categories = await db.query.categories.findMany({
    where: (categories, { isNull }) => isNull(categories.parentId),
    columns: { slug: true },
  });

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Return all combined pages
  return [...staticPages, ...productPages, ...categoryPages];
}
