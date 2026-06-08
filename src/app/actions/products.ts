"use server";

import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function ensureProductsTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
        main_category_id INTEGER,
        sub_category_id INTEGER,
        selling_price NUMERIC NOT NULL,
        actual_price NUMERIC NOT NULL,
        cod_advance INTEGER DEFAULT 100 NOT NULL,
        stock INTEGER DEFAULT 0 NOT NULL,
        supplier_name VARCHAR(255),
        key_features JSONB DEFAULT '[]'::jsonb NOT NULL,
        color_variants JSONB DEFAULT '[]'::jsonb NOT NULL,
        size_variants JSONB DEFAULT '[]'::jsonb NOT NULL,
        description TEXT,
        main_image TEXT NOT NULL,
        gallery_images JSONB DEFAULT '[]'::jsonb NOT NULL,
        is_most_selling BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Ensure all columns exist just in case of an old schema
    await db.execute(sql`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Unnamed';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255) DEFAULT md5(random()::text);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS main_category_id INTEGER;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INTEGER;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS actual_price NUMERIC DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS cod_advance INTEGER DEFAULT 100 NOT NULL;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0 NOT NULL;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS key_features JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS size_variants JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image TEXT DEFAULT '';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_most_selling BOOLEAN DEFAULT false NOT NULL;
    `);
  } catch (error) {
    console.error("Auto-migration for products failed:", error);
  }
}

export async function getAllProducts() {
  await ensureProductsTableExists();
  return await db.query.products.findMany({
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(data: any) {
  await ensureProductsTableExists();

  let cleanSlug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const existingProduct = await db.query.products.findFirst({
    where: eq(products.slug, cleanSlug),
  });

  if (existingProduct) {
    cleanSlug = `${cleanSlug}-${Date.now()}`;
  }

  await db.insert(products).values({
    name: data.name,
    slug: cleanSlug,
    brandId: data.brandId,
    mainCategoryId: data.mainCategoryId,
    subCategoryId: data.subCategoryId,
    sellingPrice: data.sellingPrice,
    actualPrice: data.actualPrice,
    codAdvance: data.codAdvance, // NAYA FIELD
    stock: data.stock,
    supplierName: data.supplierName || null,
    description: data.description,
    mainImage: data.mainImage,
    keyFeatures: sql`${JSON.stringify(data.keyFeatures)}::jsonb`,
    colorVariants: sql`${JSON.stringify(data.colorVariants)}::jsonb`,
    sizeVariants: sql`${JSON.stringify(data.sizeVariants)}::jsonb`,
    galleryImages: sql`${JSON.stringify(data.galleryImages)}::jsonb`,
  });

  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(id: number, data: any) {
  await ensureProductsTableExists();

  await db
    .update(products)
    .set({
      name: data.name,
      brandId: data.brandId,
      mainCategoryId: data.mainCategoryId,
      subCategoryId: data.subCategoryId,
      sellingPrice: data.sellingPrice,
      actualPrice: data.actualPrice,
      codAdvance: data.codAdvance, // NAYA FIELD
      stock: data.stock,
      supplierName: data.supplierName || null,
      description: data.description,
      mainImage: data.mainImage,
      keyFeatures: sql`${JSON.stringify(data.keyFeatures)}::jsonb`,
      colorVariants: sql`${JSON.stringify(data.colorVariants)}::jsonb`,
      sizeVariants: sql`${JSON.stringify(data.sizeVariants)}::jsonb`,
      galleryImages: sql`${JSON.stringify(data.galleryImages)}::jsonb`,
    })
    .where(eq(products.id, id));

  return { success: true };
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

export async function getDropdownCategories() {
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function toggleProductMostSelling(
  id: number,
  currentStatus: boolean,
) {
  try {
    await db
      .update(products)
      .set({ isMostSelling: !currentStatus })
      .where(eq(products.id, id));

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true, newStatus: !currentStatus };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}
