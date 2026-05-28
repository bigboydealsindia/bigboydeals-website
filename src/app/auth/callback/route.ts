import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Database Sync for Google Users
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, data.user.id),
      });

      if (!existingUser) {
        const allUsers = await db.select({ id: users.id }).from(users).limit(1);
        const isFirstUser = allUsers.length === 0;

        await db.insert(users).values({
          id: data.user.id,
          email: data.user.email!,
          fullName:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0],
          role: isFirstUser ? "admin" : "user",
        });
      }
    }
  }

  // Successful login ke baad home pe bhej do
  return NextResponse.redirect(`${origin}${next}`);
}
