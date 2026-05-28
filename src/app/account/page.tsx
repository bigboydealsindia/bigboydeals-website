import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata = {
  title: "My Account | Big Boy Deals",
};

export default async function AccountPage() {
  const user = await getUserProfile();

  // Agar user logged in nahi hai, toh login page bhej do
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md min-h-[80vh]">
      <AccountClient user={user} />
    </div>
  );
}
