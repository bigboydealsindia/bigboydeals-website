import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Production URL ko priority dein, warna request origin use karein
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      try {
        // Database Sync for Google Users
        const existingUser = await db.query.users.findFirst({
          where: eq(users.id, data.user.id),
        });

        if (!existingUser) {
          const allUsers = await db
            .select({ id: users.id })
            .from(users)
            .limit(1);
          const isFirstUser = allUsers.length === 0;

          await db.insert(users).values({
            id: data.user.id,
            email: data.user.email!,
            fullName:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            role: isFirstUser ? "admin" : "user",
          });
        }
      } catch (dbError) {
        console.error("Database sync failed during OAuth callback:", dbError);
      }
    }
  }

  // Successful login ke baad sahi URL par redirect karein
  return NextResponse.redirect(`${siteUrl}${next}`);
}
