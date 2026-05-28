"use server";

import { db } from "@/db";
import { reviews, users, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

async function ensureReviewsTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        review_text TEXT NOT NULL,
        admin_reply TEXT,
        show_on_website BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  } catch (error) {
    console.error("Auto-migration for reviews failed:", error);
  }
}

export async function getAllReviewsAdmin() {
  await ensureReviewsTableExists();
  try {
    const fetchedReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        adminReply: reviews.adminReply,
        showOnWebsite: reviews.showOnWebsite,
        createdAt: reviews.createdAt,
        productId: reviews.productId,
        userName: users.fullName,
        productName: products.name,
        productSlug: products.slug,
        productImage: products.mainImage,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .orderBy(desc(reviews.createdAt));

    return fetchedReviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}

export async function toggleReviewVisibility(
  id: number,
  showOnWebsite: boolean,
) {
  await db.update(reviews).set({ showOnWebsite }).where(eq(reviews.id, id));
  return { success: true };
}

export async function replyToReview(id: number, adminReply: string) {
  await db.update(reviews).set({ adminReply }).where(eq(reviews.id, id));
  return { success: true };
}

export async function getProductReviews(productId: number) {
  await ensureReviewsTableExists();
  try {
    const fetchedReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        adminReply: reviews.adminReply,
        showOnWebsite: reviews.showOnWebsite,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        userName: users.fullName,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return fetchedReviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      userName: r.userName || "Customer",
    }));
  } catch (error) {
    console.error("Failed to fetch product reviews:", error);
    return [];
  }
}

export async function submitProductReview(
  productId: number,
  rating: number,
  reviewText: string,
  userId?: string,
  userName?: string,
) {
  await ensureReviewsTableExists();
  try {
    // FIX: Ensure user profile exists in the users table to prevent Foreign Key constraint failure
    if (userId) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        await db.insert(users).values({
          id: userId,
          fullName: userName || "Customer",
        });
      }
    }

    const [insertedReview] = await db
      .insert(reviews)
      .values({
        productId,
        userId: userId || null,
        rating,
        reviewText,
        showOnWebsite: true,
      })
      .returning({ id: reviews.id });

    return { success: true, id: insertedReview.id };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function updateProductReview(
  id: number,
  rating: number,
  reviewText: string,
) {
  try {
    await db
      .update(reviews)
      .set({ rating, reviewText })
      .where(eq(reviews.id, id));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteProductReview(id: number) {
  try {
    await db.delete(reviews).where(eq(reviews.id, id));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
