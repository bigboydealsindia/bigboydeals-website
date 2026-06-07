import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// FIX: Ye line Next.js ko batayegi ki admin pages ko build time pe pre-render nahi karna hai.
// Isse Vercel build time pe database query nahi karega aur 60-second timeout error solve ho jayega.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect("/login");
  }

  // Check Role in Database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, data.user.id),
  });

  // NAYA: Ab 'admin' aur 'staff' dono ko entry milegi
  if (dbUser?.role !== "admin" && dbUser?.role !== "staff") {
    redirect("/"); // Non-admins and non-staff are sent back to the store
  }

  return (
    // Changed to `flex-col lg:flex-row` so mobile has TopBar at the top and content below
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background overflow-hidden">
      <AdminSidebar user={dbUser} />

      {/* Floating Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 lg:pl-0 overflow-hidden bg-background flex flex-col">
        <div className="h-full w-full bg-background rounded-[var(--radius)] shadow-[0_0_15px_rgba(0,0,0,0.03)] border border-border p-4 lg:p-6 overflow-y-auto relative flex flex-col">
          <AdminBreadcrumb />

          <div className="w-full max-w-[1400px] mx-auto flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
