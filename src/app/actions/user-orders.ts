"use server";

import { db } from "@/db";
import { orders, orderItems, products, productVariants } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserProfile } from "./auth";

export async function getUserOrders() {
  const user = await getUserProfile();
  if (!user) return { success: false, orders: [] };

  try {
    // 1. Fetch all orders for the logged-in user
    const rawOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    // 2. Fetch all order items with product and variant details
    const rawItems = await db
      .select({
        item: orderItems,
        variant: productVariants,
        product: products,
      })
      .from(orderItems)
      .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id));

    // 3. Map items to their respective orders
    const formattedOrders = rawOrders.map((o) => {
      const itemsForOrder = rawItems.filter((ri) => ri.item.orderId === o.id);
      return {
        ...o,
        items: itemsForOrder,
      };
    });

    return { success: true, orders: formattedOrders };
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return { success: false, orders: [] };
  }
}
