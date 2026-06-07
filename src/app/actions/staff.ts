"use server";

import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { users } from "@/db/schema";

// ⚠️ Dhyan dein: Yahan hum normal createClient use nahi kar rahe.
// Hum Supabase-js package se Admin Client use kar rahe hain taaki RLS bypass ho aur Admin logout na ho.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function createStaffAccount(
  formData: FormData,
  accessPages: string[],
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    // 1. Create user securely using Admin API (Bypasses regular Auth flow)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Email verify karne ki zaroorat nahi
        user_metadata: { full_name: fullName },
      });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (authData.user) {
      // 2. Insert user into our database with 'staff' role and access pages
      await db.insert(users).values({
        id: authData.user.id,
        email: authData.user.email!,
        fullName: fullName,
        role: "staff",
        accessPages: accessPages,
      });

      return { success: true };
    }

    return { success: false, error: "Something went wrong during creation." };
  } catch (error) {
    console.error("Error creating staff:", error);
    return { success: false, error: "Internal server error." };
  }
}
