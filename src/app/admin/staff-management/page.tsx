import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StaffManagementClient } from "@/components/admin/StaffManagementClient";

export const metadata = {
  title: "Staff Management | Admin Panel",
};

export default async function StaffManagementPage() {
  // Database se sirf un users ko fetch karo jinka role "staff" hai
  const staffList = await db.query.users.findMany({
    where: eq(users.role, "staff"),
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return (
    <main className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Staff Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Add new staff members and manage their page access permissions.
        </p>
      </div>

      <StaffManagementClient initialStaff={staffList} />
    </main>
  );
}
