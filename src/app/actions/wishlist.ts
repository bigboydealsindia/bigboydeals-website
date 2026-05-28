"use server";

import { db } from "@/db";
import { sql, and, eq } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { users, products } from "@/db/schema";
import { getUserProfile } from "./auth";

// FIX: Removed 'export' from here. A "use server" file cannot export objects.
const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Auto-migration for wishlist table (Not exported, used internally)
async function ensureWishlistTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, product_id)
      );
    `);
  } catch (error) {
    console.error("Auto-migration for wishlists failed:", error);
  }
}

// Toggle product in DB (Exported Async Function)
export async function toggleProductWishlist(productId: number) {
  await ensureWishlistTableExists();

  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)),
      );

    if (existing.length > 0) {
      await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
      return { success: true, isWishlisted: false };
    } else {
      await db.insert(wishlists).values({ userId: user.id, productId });
      return { success: true, isWishlisted: true };
    }
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

// Fetch user's entire wishlist (Exported Async Function)
export async function getUserWishlistIds() {
  await ensureWishlistTableExists();

  const user = await getUserProfile();
  if (!user) return [];

  const list = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, user.id));

  return list.map((item) => item.productId);
}
