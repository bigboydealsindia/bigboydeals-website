"use server";

import { db } from "@/db";
import { telegramSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function getTelegramSettings() {
  try {
    const settings = await db.select().from(telegramSettings).limit(1);
    return settings[0] || null;
  } catch (error) {
    console.error("Error fetching Telegram settings:", error);
    return null;
  }
}

export async function updateTelegramSettings(data: {
  botToken: string;
  chatId: string;
}) {
  try {
    const existing = await db.select().from(telegramSettings).limit(1);
    if (existing.length > 0) {
      await db
        .update(telegramSettings)
        .set({ botToken: data.botToken, chatId: data.chatId })
        .where(eq(telegramSettings.id, existing[0].id));
    } else {
      await db
        .insert(telegramSettings)
        .values({ botToken: data.botToken, chatId: data.chatId });
    }
    revalidatePath("/admin/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error updating Telegram settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function sendTelegramOrderNotification(
  orderId: number,
  user: any,
  orderData: any,
) {
  const settings = await getTelegramSettings();
  if (!settings || !settings.botToken || !settings.chatId) return false;

  const total = Number(orderData.totalAmount);
  const isOnline =
    orderData.paymentMethod === "online" ||
    orderData.paymentMethod === "razorpay";
  const amountPaid = isOnline ? total : 100;
  const balanceDue = isOnline ? 0 : total - 100;

  // Formatting a beautiful Telegram Message using HTML tags
  let message = `🛒 <b>NEW ORDER RECEIVED!</b> 🛒\n\n`;
  message += `<b>Order ID:</b> #${orderId}\n`;
  message += `<b>Date:</b> ${new Date().toLocaleString("en-IN")}\n\n`;

  message += `👤 <b>CUSTOMER DETAILS</b>\n`;
  message += `<b>Name:</b> ${user.fullName || "N/A"}\n`;
  message += `<b>Phone:</b> ${user.phone || "N/A"}\n`;
  message += `<b>Email:</b> ${user.email || "N/A"}\n`;
  message += `<b>Address:</b> ${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pin}\n\n`;

  message += `📦 <b>ORDER ITEMS</b>\n`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const item of orderData.cartDetails) {
    message += `▪️ <b>${item.product.name}</b>\n`;
    message += `   Qty: ${item.quantity} | Color: ${item.color} | Size: ${item.size}\n`;
  }

  message += `\n💳 <b>PAYMENT SUMMARY</b>\n`;
  message += `<b>Method:</b> ${isOnline ? "Online Pay" : "Cash on Delivery"}\n`;
  if (orderData.couponCode) {
    message += `<b>Coupon:</b> ${orderData.couponCode} (-₹${orderData.couponDiscount})\n`;
  }
  message += `<b>Total Amount:</b> ₹${total.toLocaleString("en-IN")}\n`;
  message += `<b>Paid Amount:</b> ₹${amountPaid.toLocaleString("en-IN")}\n`;
  message += `<b>Balance Due:</b> ₹${balanceDue.toLocaleString("en-IN")}\n`;

  const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    return true;
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return false;
  }
}


// NAYA FUNCTION: Contact Message Notification
export async function sendTelegramContactNotification(data: {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const settings = await getTelegramSettings();
  if (!settings || !settings.botToken || !settings.chatId) return false;

  let text = `📩 <b>NEW CONTACT MESSAGE!</b> 📩\n\n`;
  text += `👤 <b>SENDER DETAILS</b>\n`;
  text += `<b>Name:</b> ${data.fullName}\n`;
  text += `<b>Email:</b> ${data.email}\n`;
  text += `<b>Phone:</b> ${data.phone || "Not Provided"}\n\n`;
  
  text += `📝 <b>MESSAGE CONTENT</b>\n`;
  text += `<b>Subject:</b> ${data.subject}\n`;
  text += `<b>Message:</b> \n${data.message}\n`;

  const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    return true;
  } catch (error) {
    console.error("Telegram contact notification failed:", error);
    return false;
  }
}