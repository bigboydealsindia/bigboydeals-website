"use server";

import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function getContactInfo() {
  try {
    const settings = await db.select().from(storeSettings).limit(1);
    if (settings.length > 0 && settings[0].contactInfo) {
      return settings[0].contactInfo;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch contact info:", error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateContactInfo(contactData: any) {
  try {
    const settings = await db.select().from(storeSettings).limit(1);

    if (settings.length > 0) {
      await db.update(storeSettings).set({ contactInfo: contactData });
    } else {
      await db.insert(storeSettings).values({
        contactInfo: contactData,
        marqueeTexts: [],
        heroBanners: [],
        salesBanners: [],
      });
    }

    revalidatePath("/admin/settings/contact-info");
    revalidatePath("/"); // Will update footer on the storefront
    return { success: true };
  } catch (error) {
    console.error("Failed to update contact info:", error);
    return { success: false, error: "Failed to update contact details." };
  }
}
