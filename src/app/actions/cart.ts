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

const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  color: varchar("color", { length: 100 }).notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

async function ensureCartTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        color VARCHAR(100) NOT NULL,
        size VARCHAR(50) NOT NULL,
        quantity INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  } catch (error) {
    console.error("Auto-migration for cart_items failed:", error);
  }
}

export async function addProductToCart(
  productId: number,
  color: string,
  size: string,
) {
  await ensureCartTableExists();
  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, user.id),
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.color, color),
          eq(cartItemsTable.size, size),
        ),
      );

    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }

    const inserted = await db
      .insert(cartItemsTable)
      .values({
        userId: user.id,
        productId,
        color,
        size,
        quantity: 1,
      })
      .returning({ id: cartItemsTable.id });

    return {
      success: true,
      alreadyExists: false,
      id: inserted[0].id,
      productId,
      color,
      size,
      quantity: 1,
    };
  } catch (error) {
    return { success: false, error: "Database operation failed" };
  }
}

export async function getUserCartItems() {
  await ensureCartTableExists();
  const user = await getUserProfile();
  if (!user) return [];

  try {
    const items = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.userId, user.id));

    return items.map((i) => ({
      id: i.id,
      productId: i.productId,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
    }));
  } catch (error) {
    return [];
  }
}

// NAYA: Remove Item Action
export async function removeCartItem(cartItemId: number) {
  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.id, cartItemId),
          eq(cartItemsTable.userId, user.id),
        ),
      );
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove item" };
  }
}

// NAYA: Update Quantity Action
export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
) {
  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(
        and(
          eq(cartItemsTable.id, cartItemId),
          eq(cartItemsTable.userId, user.id),
        ),
      );
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update quantity" };
  }
}
