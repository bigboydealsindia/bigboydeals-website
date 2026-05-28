"use server";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAllCoupons() {
  try {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  } catch (error) {
    console.error("Fetch coupons error:", error);
    return [];
  }
}

export async function createCoupon(data: {
  code: string;
  type: "flat" | "overall_percent" | "per_product";
  discountValue: string;
  applicableProducts: number[];
  isActive: boolean;
}) {
  try {
    await db.insert(coupons).values({
      code: data.code.toUpperCase(),
      type: data.type,
      discountValue: data.discountValue,
      applicableProducts: data.applicableProducts,
      isActive: data.isActive,
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    if (error.code === "23505") {
      return { success: false, error: "Coupon code already exists." };
    }
    return { success: false, error: "Failed to create coupon." };
  }
}

export async function updateCoupon(
  id: number,
  data: {
    code: string;
    type: "flat" | "overall_percent" | "per_product";
    discountValue: string;
    applicableProducts: number[];
    isActive: boolean;
  },
) {
  try {
    await db
      .update(coupons)
      .set({
        code: data.code.toUpperCase(),
        type: data.type,
        discountValue: data.discountValue,
        applicableProducts: data.applicableProducts,
        isActive: data.isActive,
      })
      .where(eq(coupons.id, id));

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    if (error.code === "23505") {
      return { success: false, error: "Coupon code already exists." };
    }
    return { success: false, error: "Failed to update coupon." };
  }
}

export async function deleteCoupon(id: number) {
  try {
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete coupon." };
  }
}

// Add this at the bottom of src/app/actions/coupons.ts
export async function getActiveCoupons() {
  try {
    return await db.select().from(coupons).where(eq(coupons.isActive, true));
  } catch (error) {
    console.error("Fetch active coupons error:", error);
    return [];
  }
}