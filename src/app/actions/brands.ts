"use server";

import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function ensureBrandsTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  } catch (error) {
    console.error("Auto-migration for brands failed:", error);
  }
}

export async function getAllBrands() {
  await ensureBrandsTableExists();
  return await db.query.brands.findMany({
    orderBy: (brands, { desc }) => [desc(brands.createdAt)],
  });
}

export async function createBrand(name: string, imageUrl: string | null) {
  await ensureBrandsTableExists();

  const cleanSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const existingBrand = await db.query.brands.findFirst({
    where: eq(brands.slug, cleanSlug),
  });

  if (existingBrand) {
    return { success: false, error: "A brand with this name already exists." };
  }

  await db.insert(brands).values({
    name,
    slug: cleanSlug,
    imageUrl,
  });

  return { success: true };
}

export async function updateBrand(
  id: number,
  name: string,
  imageUrl: string | null,
) {
  await ensureBrandsTableExists();
  await db.update(brands).set({ name, imageUrl }).where(eq(brands.id, id));

  return { success: true };
}

export async function deleteBrand(id: number) {
  await db.delete(brands).where(eq(brands.id, id));
  return { success: true };
}
