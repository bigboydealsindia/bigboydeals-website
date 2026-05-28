"use server";

import { db } from "@/db";
import { products, brands } from "@/db/schema";
import { ilike, or, eq, desc } from "drizzle-orm";

export async function searchProducts(query: string) {
  if (!query || query.trim() === "") return [];

  // Split query into words to allow partial and flexible matching
  const searchTerms = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1);

  if (searchTerms.length === 0) return [];

  try {
    // Create ILIKE conditions for each word to make it "Smart"
    const conditions = searchTerms.map((term) => {
      const formattedTerm = `%${term}%`;
      return or(
        ilike(products.name, formattedTerm),
        ilike(products.description, formattedTerm),
        ilike(brands.name, formattedTerm),
      );
    });

    const results = await db
      .select({
        product: products,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(or(...conditions))
      .orderBy(desc(products.isMostSelling), desc(products.createdAt))
      .limit(6); // Limit live suggestions to 6 items

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
