"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// NAYA IMPORT
import { sendTelegramContactNotification } from "./telegram";

// FRONTEND: User submits a message
export async function submitContactMessage(data: {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  try {
    // 1. Save to Database
    await db.insert(contactMessages).values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    // 2. Trigger Telegram Notification in background
    sendTelegramContactNotification(data).catch((err) =>
      console.error("Telegram Notification Error:", err),
    );

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Submit message error:", error);
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }
}

// ADMIN: Fetch all messages
export async function getContactMessages() {
  try {
    const messages = await db.query.contactMessages.findMany({
      orderBy: [desc(contactMessages.createdAt)],
    });
    return messages;
  } catch (error) {
    console.error("Fetch messages error:", error);
    return [];
  }
}

// ADMIN: Mark messages as read
export async function markMessagesAsRead(ids: number[]) {
  if (ids.length === 0) return { success: true };
  try {
    await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(inArray(contactMessages.id, ids));

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark as read." };
  }
}
