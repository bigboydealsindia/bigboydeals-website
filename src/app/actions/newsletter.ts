"use server";

import { db } from "@/db";
import { newsletterSubscribers, users } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// FRONTEND: User subscription
export async function subscribeToNewsletter(
  userId: string,
  whatsappNumber: string,
) {
  try {
    // Check if user has already subscribed
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.userId, userId),
    });

    if (existing) {
      return {
        success: false,
        error: "You are already subscribed to our WhatsApp updates!",
      };
    }

    await db.insert(newsletterSubscribers).values({
      userId,
      whatsappNumber: whatsappNumber,
    });

    revalidatePath("/admin/newsletter");
    return { success: true };
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ADMIN: Fetch all subscribers with their User details
export async function getNewsletterSubscribers() {
  try {
    const data = await db
      .select({
        id: newsletterSubscribers.id,
        whatsappNumber: newsletterSubscribers.whatsappNumber,
        isRead: newsletterSubscribers.isRead,
        createdAt: newsletterSubscribers.createdAt,
        userName: users.fullName,
        loginEmail: users.email,
        phone: users.phone,
      })
      .from(newsletterSubscribers)
      .innerJoin(users, eq(newsletterSubscribers.userId, users.id))
      .orderBy(desc(newsletterSubscribers.createdAt));

    return data;
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    return [];
  }
}

// ADMIN: Mark rows as read
export async function markNewslettersAsRead(ids: number[]) {
  if (ids.length === 0) return { success: true };
  try {
    await db
      .update(newsletterSubscribers)
      .set({ isRead: true })
      .where(inArray(newsletterSubscribers.id, ids));

    revalidatePath("/admin/newsletter");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark as read." };
  }
}
