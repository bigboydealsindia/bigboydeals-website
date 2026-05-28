"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getUserProfile } from "./auth";
import { revalidatePath } from "next/cache";

interface UpdateProfileData {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export async function updateUserProfileDetails(data: UpdateProfileData) {
  const user = await getUserProfile();

  if (!user) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    await db
      .update(users)
      .set({
        fullName: data.fullName,
        phone: data.phone,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: "India", // Hardcoded strictly as requested
      })
      .where(eq(users.id, user.id));

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
