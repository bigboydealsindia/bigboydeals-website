"use server";

import { db } from "@/db";
import { orders, orderItems, cartItems, productVariants } from "@/db/schema";
import { getUserProfile } from "./auth";
import { eq, and, ilike } from "drizzle-orm";
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
    amount: Math.round(amountInINR * 100), // paise (Math.round to prevent decimal errors)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("🔴 Razorpay order creation failed:", error);
    return { success: false, error: "Razorpay order creation failed" };
  }
}

export async function confirmOrder(data: {
  totalAmount: number;
  codAdvancePaid?: number;
  paymentMethod: "razorpay" | "cod";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shippingAddress: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartDetails: any[];
  couponCode?: string | null;
  couponDiscount?: number;
}) {
  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Create the main Order with Coupon data and COD advance paid
    const insertedOrder = await db
      .insert(orders)
      .values({
        userId: user.id,
        totalAmount: data.totalAmount.toString(),
        codAdvancePaid: data.codAdvancePaid
          ? data.codAdvancePaid.toString()
          : "0",
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

    // 2. Safely Process and Insert Order Items (Advanced Variant Matching)
    for (const item of data.cartDetails) {
      // Fallback variables
      const itemColor = item.color || "Default";
      const itemSize = item.size || "Default";

      // Use ilike for case-insensitive matching to prevent case mismatch errors
      let variantRecord;
      const exactVariants = await db
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, item.productId),
            ilike(productVariants.color, itemColor),
            ilike(productVariants.size, itemSize),
          ),
        )
        .limit(1);

      if (exactVariants.length > 0) {
        variantRecord = exactVariants[0];
      } else {
        // Fallback: Agar exact size/color nahi mila toh uss product ka pehla variant uthao
        const anyVariants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, item.productId))
          .limit(1);

        if (anyVariants.length > 0) {
          variantRecord = anyVariants[0];
        } else {
          // Agar database mein koi variant exist hi nahi karta, toh naya bana lo (Failsafe)
          const newVars = await db
            .insert(productVariants)
            .values({
              productId: item.productId,
              color: itemColor,
              size: itemSize,
              images: [],
              stock: 10, // Default stock
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

    // 4. Send Telegram Notification (Background Async task)
    sendTelegramOrderNotification(orderId, user, data).catch((err) =>
      console.error("🔴 Telegram Notification Error:", err),
    );

    return { success: true, orderId };
  } catch (error: any) {
    // ADVANCED LOGGING: Isse actual exact error VS Code ke terminal mein dikhega!
    console.error(
      "🔴 ORDER INSERTION DATABASE ERROR ->",
      error.message || error,
    );

    // Frontend par original error message bhejna taaki issue turant samajh aaye
    return {
      success: false,
      error: `DB Error: ${error.message || "Failed to process order"}`,
    };
  }
}
