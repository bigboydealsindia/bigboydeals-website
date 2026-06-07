"use server";

import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (authData.user) {
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

// FIX: Updated to handle password changes
export async function updateStaffAccount(
  id: string,
  fullName: string,
  accessPages: string[],
  newPassword?: string,
) {
  try {
    // Agar admin ne naya password daala hai, toh use update karo
    if (newPassword && newPassword.trim() !== "") {
      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          password: newPassword,
        });
      if (authError) {
        return { success: false, error: authError.message };
      }
    }

    // Database mein name aur pages update karo
    await db
      .update(users)
      .set({ fullName, accessPages })
      .where(eq(users.id, id));

    return { success: true };
  } catch (error) {
    console.error("Error updating staff:", error);
    return { success: false, error: "Failed to update staff details." };
  }
}

export async function deleteStaffAccount(id: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return { success: false, error: error.message };

    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false, error: "Failed to delete staff account." };
  }
}
