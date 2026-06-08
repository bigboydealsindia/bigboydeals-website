import { getNewsletterSubscribers } from "@/app/actions/newsletter";
import { NewsletterClient } from "@/components/admin/NewsletterClient";

export const revalidate = 0; // Disable static generation

export const metadata = {
  title: "WhatsApp Subscribers | Admin Panel",
};

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();

  return (
    <div className="w-full">
      <NewsletterClient initialData={subscribers} />
    </div>
  );
}
