import { getContactInfo } from "@/app/actions/contact";
import { ContactUsClient } from "@/components/contact/ContactUsClient";

export const metadata = {
  title: "Contact Us | Big Boy Deals",
  description:
    "Get in touch with us. We are here to help and answer any questions you might have.",
};

export default async function ContactUsPage() {
  // Fetch dynamic contact data from admin settings
  const contactInfo = await getContactInfo();

  return <ContactUsClient contactInfo={contactInfo} />;
}
