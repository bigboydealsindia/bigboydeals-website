"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserProfile } from "./auth";

export async function quickSaveAddress(data: {
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}) {
  const user = await getUserProfile();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(users)
      .set({
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
      })
      .where(eq(users.id, user.id));

    return { success: true, user: { ...user, ...data } };
  } catch (error) {
    console.error("Address save error:", error);
    return { success: false, error: "Failed to save address" };
  }
}
