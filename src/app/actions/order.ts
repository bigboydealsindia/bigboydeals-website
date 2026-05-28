"use server";

import { db } from "@/db";
import { orders, orderItems, cartItems, productVariants } from "@/db/schema";
import { getUserProfile } from "./auth";
import { eq, and } from "drizzle-orm";
import Razorpay from "razorpay";
import { sendTelegramOrderNotification } from "./telegram";

export async function createRazorpayOrderId(amountInINR: number) {
  if (
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    return {
      success: false,
      error: "Razorpay keys are missing in environment variables.",
    };
  }

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amountInINR * 100, // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return { success: false, error: "Razorpay order creation failed" };
  }
}

export async function confirmOrder(data: {
  totalAmount: number;
  paymentMethod: "razorpay" | "cod"; // FIX: Removed "online" to match database schema strictly
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shippingAddress: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartDetails: any[];
  // Coupon Details
  couponCode?: string | null;
  couponDiscount?: number;
}) {
  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Create the main Order with Coupon data
    const insertedOrder = await db
      .insert(orders)
      .values({
        userId: user.id,
        totalAmount: data.totalAmount.toString(),
        status: "processing",
        paymentMethod: data.paymentMethod,
        razorpayOrderId: data.razorpayOrderId || null,
        razorpayPaymentId: data.razorpayPaymentId || null,
        shippingAddress: data.shippingAddress,
        couponCode: data.couponCode || null,
        couponDiscount: data.couponDiscount
          ? data.couponDiscount.toString()
          : "0",
      })
      .returning({ id: orders.id });

    const orderId = insertedOrder[0].id;

    // 2. Safely Process and Insert Order Items
    for (const item of data.cartDetails) {
      const exactVariants = await db
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, item.productId),
            eq(productVariants.color, item.color),
            eq(productVariants.size, item.size),
          ),
        )
        .limit(1);

      let variantRecord = exactVariants[0];

      if (!variantRecord) {
        const anyVariants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, item.productId))
          .limit(1);

        if (anyVariants.length > 0) {
          variantRecord = anyVariants[0];
        } else {
          const newVars = await db
            .insert(productVariants)
            .values({
              productId: item.productId,
              color: item.color || "Default",
              size: item.size || "Default",
              images: [],
              stock: 10,
            })
            .returning();
          variantRecord = newVars[0];
        }
      }

      await db.insert(orderItems).values({
        orderId: orderId,
        variantId: variantRecord.id,
        quantity: item.quantity,
        priceAtPurchase: item.product.sellingPrice.toString(),
      });
    }

    // 3. Clear the user's cart
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));

    // 4. SMART: Send Telegram Notification (Background Async task)
    sendTelegramOrderNotification(orderId, user, data).catch((err) =>
      console.error("Telegram Notification Error:", err),
    );

    return { success: true, orderId };
  } catch (error) {
    console.error("Order Confirmation Error:", error);
    return { success: false, error: "Failed to process order" };
  }
}
