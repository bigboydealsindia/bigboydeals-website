import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata = {
  title: "My Profile | Big Boy Deals",
  description: "Manage your personal information and delivery address.",
};

export default async function ProfilePage() {
  const user = await getUserProfile();

  // Agar user login nahi hai to login page par bhej do
  if (!user) {
    redirect("/login?next=/profile");
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 min-h-[70vh]">
      <ProfileClient user={user} />
    </div>
  );
}
