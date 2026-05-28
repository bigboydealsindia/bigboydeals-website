import { getTelegramSettings } from "@/app/actions/telegram";
import { NotificationsClient } from "@/components/admin/NotificationsClient";

export const metadata = {
  title: "Notification Settings | Admin",
};

export default async function NotificationsPage() {
  const settings = await getTelegramSettings();

  return (
    <div className="w-full">
      <NotificationsClient initialSettings={settings} />
    </div>
  );
}
