"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Smart Auto-Migration
async function ensureCategoriesTableUpdated() {
  try {
    await db.execute(sql`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;
    `);
  } catch (error) {
    console.error("Auto-migration for categories failed:", error);
  }
}

// Fetch Categories (Ab ordered by sort_order ascending ayenge)
export async function getAllCategories() {
  await ensureCategoriesTableUpdated();
  return await db.query.categories.findMany({
    orderBy: (categories, { asc, desc }) => [
      asc(categories.sortOrder),
      desc(categories.createdAt),
    ],
  });
}

// New: Update Order for Drag & Drop
export async function updateCategoryOrders(
  updates: { id: number; sortOrder: number }[],
) {
  await ensureCategoriesTableUpdated();

  try {
    // Updating all items with their new order index
    await Promise.all(
      updates.map((item) =>
        db
          .update(categories)
          .set({ sortOrder: item.sortOrder })
          .where(eq(categories.id, item.id)),
      ),
    );
    return { success: true };
  } catch (error) {
    console.error("Order update failed:", error);
    return { success: false, error: "Failed to update layout order." };
  }
}

export async function createCategory(
  name: string,
  imageUrl: string | null,
  parentId: number | null,
) {
  await ensureCategoriesTableUpdated();
  const cleanSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, cleanSlug),
  });

  if (existingCategory) {
    return {
      success: false,
      error: "A category with this name already exists.",
    };
  }

  // Get current max order to place new items at the end
  const existingCats = await getAllCategories();
  const maxOrder =
    existingCats.length > 0
      ? Math.max(...existingCats.map((c) => c.sortOrder || 0))
      : 0;

  await db.insert(categories).values({
    name,
    slug: cleanSlug,
    imageUrl,
    parentId,
    sortOrder: maxOrder + 1, // New category always comes last by default
  });

  return { success: true };
}

export async function updateCategory(
  id: number,
  name: string,
  imageUrl: string | null,
  parentId: number | null,
) {
  await ensureCategoriesTableUpdated();
  await db
    .update(categories)
    .set({ name, imageUrl, parentId })
    .where(eq(categories.id, id));

  return { success: true };
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}
