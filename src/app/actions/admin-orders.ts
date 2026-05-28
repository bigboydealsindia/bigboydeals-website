"use server";

import { db } from "@/db";
import {
  orders,
  orderItems,
  products,
  users,
  productVariants,
  storeSettings,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminOrders() {
  try {
    // 1. Fetch all orders with user details
    const rawOrders = await db
      .select({
        order: orders,
        user: users,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
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
    const ordersWithItems = rawOrders.map((ro) => {
      const itemsForOrder = rawItems.filter(
        (ri) => ri.item.orderId === ro.order.id,
      );
      return {
        ...ro,
        items: itemsForOrder,
      };
    });

    // 4. Fetch store settings for Invoice Branding (Address, Logo, Email etc.)
    const settings = await db.select().from(storeSettings).limit(1);

    return {
      success: true,
      orders: ordersWithItems,
      storeInfo: settings[0]?.contactInfo || null,
    };
  } catch (error) {
    console.error("Fetch orders error:", error);
    return { success: false, orders: [] };
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));

    // Revalidate paths to update UI instantly
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, error: "Failed to update order status." };
  }
}
