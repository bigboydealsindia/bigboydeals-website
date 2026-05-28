import { getDashboardStats } from "@/app/actions/dashboard";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const metadata = {
  title: "Admin Dashboard | Big Boy Deals",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="w-full">
      <DashboardClient stats={stats} />
    </div>
  );
}
