import { getContactMessages } from "@/app/actions/contact-messages";
import { MessagesClient } from "@/components/admin/MessagesClient";

export const metadata = {
  title: "Contact Messages | Admin Panel",
};

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  return (
    <div className="w-full">
      <MessagesClient initialData={messages} />
    </div>
  );
}