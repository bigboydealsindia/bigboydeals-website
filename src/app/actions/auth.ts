"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Database Sync Logic: Pehla user admin, baaki sab normal user
async function syncUserToDatabase(
  supabaseUser: any,
  fullName: string,
  phone?: string,
) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, supabaseUser.id),
  });

  if (!existingUser) {
    const allUsers = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = allUsers.length === 0;

    await db.insert(users).values({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      phone: phone || null,
      fullName:
        fullName ||
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email?.split("@")[0] ||
        "User",
      role: isFirstUser ? "admin" : "user",
    });
  }
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) return { success: false, error: error.message };

  if (data.user) {
    await syncUserToDatabase(data.user, fullName, phone);
  }

  return { success: true };
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Smart Login Feature: Check if user exists in our database first
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return {
      success: false,
      error:
        "No account found with this email. Please create an account first.",
      needsSignup: true, // Frontend ko signal dene ke liye
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error)
    return {
      success: false,
      error: "Invalid login credentials. Please check your password.",
    };

  if (data.user) {
    await syncUserToDatabase(data.user, data.user.user_metadata?.full_name);
  }

  return { success: true };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) return { success: false, error: error.message };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Yahan se redirect("/login") hata diya hai taaki "Failed to fetch" error na aaye.
  // Redirect ab hum client-side se karenge.
  return { success: true };
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    // 🚀 SELF-HEALING LOGIC: Google OAuth Bypass Fix
    if (!dbUser) {
      // Agar Auth mein hai par DB mein missing hai, toh yahan automatic sync chalega
      await syncUserToDatabase(
        user,
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      );

      // Sync hone ke baad turant DB se naya data fetch kar lenge
      dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });
    }

    return dbUser;
  } catch (error) {
    console.error("Error fetching or syncing user profile:", error);
    return null;
  }
}
