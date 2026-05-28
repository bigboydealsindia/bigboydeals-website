"use server";

import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

// Fetch global settings
export async function getStoreSettings() {
  let settings = null;
  try {
    settings = await db.query.storeSettings.findFirst();
  } catch (error) {
    console.log("Fetching settings failed, creating new...");
  }

  if (!settings) {
    const [newSettings] = await db
      .insert(storeSettings)
      .values({
        marqueeTexts: ["Welcome to Big Boy Deals!"],
        isMarqueeActive: true,
        heroBanners: [],
        heroVideo: null,
      })
      .returning();
    return newSettings;
  }

  return settings;
}

// Update Marquee data
export async function updateMarqueeSettings(
  texts: string[],
  isActive: boolean,
) {
  const settings = await db.query.storeSettings.findFirst();

  if (!settings) {
    await db
      .insert(storeSettings)
      .values({ marqueeTexts: texts, isMarqueeActive: isActive });
    return { success: true };
  }

  await db
    .update(storeSettings)
    .set({ marqueeTexts: texts, isMarqueeActive: isActive })
    .where(eq(storeSettings.id, settings.id));
  return { success: true };
}

// Update Hero data
export async function updateHeroSettings(banners: any[], video: any | null) {
  const settings = await db.query.storeSettings.findFirst();

  if (!settings) {
    await db
      .insert(storeSettings)
      .values({ heroBanners: banners, heroVideo: video });
    return { success: true };
  }

  await db
    .update(storeSettings)
    .set({ heroBanners: banners, heroVideo: video })
    .where(eq(storeSettings.id, settings.id));
  return { success: true };
}

// File Upload to Supabase Storage
export async function uploadAssetToStorage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const supabase = await createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `hero/${fileName}`;

  const { error } = await supabase.storage
    .from("store-assets")
    .upload(filePath, file);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from("store-assets")
    .getPublicUrl(filePath);

  return { success: true, url: publicUrlData.publicUrl };
}

// Bulk File Upload to Supabase Storage (Max 4 images for Products)
export async function uploadMultipleAssets(formDataArray: FormData[]) {
  const uploadPromises = formDataArray.map(async (formData) => {
    return await uploadAssetToStorage(formData);
  });

  const results = await Promise.all(uploadPromises);
  
  // Return arrays of successful URLs and any errors
  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach(res => {
    if (res.success && res.url) urls.push(res.url);
    if (!res.success && res.error) errors.push(res.error);
  });

  return { success: errors.length === 0, urls, errors };
}