"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { activeDeals, dealProducts } from "@/db/schema";
import { revalidatePath } from "next/cache";

// FOR USERS: Only returns if deal is ON and NOT expired
export async function getActiveDeal() {
  const deals = await db.select().from(activeDeals).limit(1);
  if (deals.length === 0) return null;

  const deal = deals[0];

  // If explicitly turned off, return null
  if (!deal.isActive) return null;

  // Smart Check: If time has passed, auto-turn off and return null
  const now = new Date();
  if (deal.endsAt < now) {
    await db
      .update(activeDeals)
      .set({ isActive: false })
      .where(eq(activeDeals.id, deal.id));
    return null;
  }

  const products = await db
    .select()
    .from(dealProducts)
    .where(eq(dealProducts.dealId, deal.id));

  return {
    durationHours: deal.durationHours,
    endsAt: deal.endsAt,
    productIds: products
      .map((p) => p.productId)
      .filter((id): id is number => id !== null),
  };
}

// FOR ADMIN: Always returns the config so they can edit it even if it's OFF
export async function getAdminDealConfig() {
  const deals = await db.select().from(activeDeals).limit(1);
  if (deals.length === 0) return null;

  const deal = deals[0];
  const products = await db
    .select()
    .from(dealProducts)
    .where(eq(dealProducts.dealId, deal.id));

  return {
    isActive: deal.isActive,
    durationHours: deal.durationHours,
    productIds: products
      .map((p) => p.productId)
      .filter((id): id is number => id !== null),
  };
}

export async function saveDeal(
  durationHours: number,
  productIds: number[],
  isActive: boolean,
) {
  try {
    const active = await db.select().from(activeDeals).limit(1);

    // Calculate exact new end time from NOW
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + durationHours);

    let dealId;

    if (active.length > 0) {
      dealId = active[0].id;
      await db
        .update(activeDeals)
        .set({ durationHours, endsAt, isActive })
        .where(eq(activeDeals.id, dealId));

      await db.delete(dealProducts).where(eq(dealProducts.dealId, dealId));
    } else {
      const newDeal = await db
        .insert(activeDeals)
        .values({
          durationHours,
          endsAt,
          isActive,
        })
        .returning({ id: activeDeals.id });
      dealId = newDeal[0].id;
    }

    if (productIds.length > 0) {
      const inserts = productIds.map((id) => ({ dealId, productId: id }));
      await db.insert(dealProducts).values(inserts);
    }

    revalidatePath("/admin/deals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Save deal error:", error);
    return { success: false, error: "Failed to save deals" };
  }
}
