"use server";

import { db } from "@/db";
import { storeSettings } from "@/db/schema"; // Ensure this matches your actual schema export
import { revalidatePath } from "next/cache";

export async function updateSalesBannersSettings(banners: any[]) {
  try {
    const settings = await db.select().from(storeSettings).limit(1);

    if (settings.length > 0) {
      await db.update(storeSettings).set({ salesBanners: banners });
    } else {
      await db.insert(storeSettings).values({ salesBanners: banners });
    }

    revalidatePath("/admin/settings/sales-banner");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update sales banners:", error);
    return { success: false, error: "Failed to update promotional banners." };
  }
}
