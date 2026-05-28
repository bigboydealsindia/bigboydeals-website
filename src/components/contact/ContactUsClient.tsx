"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  MoveUpRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { submitContactMessage } from "@/app/actions/contact-messages";

// Social SVG Icons
const SocialIcons = {
  facebook: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  youtube: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  ),
  twitter: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  ),
  threads: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M14.5 11.5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5c.78 0 1.47-.36 1.93-.92.35.43.88.72 1.48.72 1.1 0 2-1.01 2-2.25v-.55c0-2.48-1.79-4.5-4-4.5s-4 2.02-4 4.5 1.79 4.5 4 4.5c1.06 0 2.03-.47 2.7-1.22" />
    </svg>
  ),
  linkedin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  url: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ContactUsClient({ contactInfo }: { contactInfo: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const fallbackInfo = {
    address: "123 Fashion Street, Sector 4, New Delhi, India - 110001",
    email: "support@bigboydeals.com",
    phone: "+91 98765 43210",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754720611!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    socials: {},
  };

  const info = contactInfo || fallbackInfo;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Required fields missing", {
        description: "Please fill in all the required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    const res = await submitContactMessage(formData);

    if (res.success) {
      toast.success("Message Sent", {
        description:
          "We have received your message and will get back to you soon.",
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } else {
      toast.error("Delivery Failed", {
        description: res.error || "Could not send your message.",
      });
    }

    setIsSubmitting(false);
  };

  const formatExternalLink = (url: string) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 md:py-12 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold truncate">
          Contact Us
        </span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
          Have a question about our products, your order, or just want to say
          hi? Fill out the form below and our team will be happy to assist you.
        </p>
      </div>

      {/* Main Grid: 5 columns for Info, 7 columns for Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Side: Contact Information (Spans 5 columns) */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-8">
            <h2 className="text-2xl font-medium tracking-tight border-b border-border pb-4">
              Contact Information
            </h2>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-xl bg-primary/10 text-primary shrink-0 shadow-sm border border-primary/10">
                  <Mail size={24} />
                </div>
                <div className="space-y-1.5 mt-1">
                  <h3 className="text-lg font-bold text-foreground">
                    Email Us
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {info.email}
                  </p>
                  {info.additionalEmail && (
                    <p className="text-base text-muted-foreground">
                      {info.additionalEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-4 rounded-xl bg-primary/10 text-primary shrink-0 shadow-sm border border-primary/10">
                  <Phone size={24} />
                </div>
                <div className="space-y-1.5 mt-1">
                  <h3 className="text-lg font-bold text-foreground">Call Us</h3>
                  <p className="text-base text-muted-foreground">
                    {info.phone}
                  </p>
                  {info.additionalPhone && (
                    <p className="text-base text-muted-foreground">
                      {info.additionalPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="p-4 rounded-xl bg-primary/10 text-primary shrink-0 shadow-sm border border-primary/10">
                  <MapPin size={24} />
                </div>
                <div className="space-y-1.5 mt-1">
                  <h3 className="text-lg font-bold text-foreground">
                    Office Address
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                    {info.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Icons */}
          {info.socials &&
            Object.values(info.socials).some(
              (url) => url && (url as string).trim() !== "",
            ) && (
              <div className="space-y-5 pt-4">
                <h3 className="text-lg font-bold text-foreground">Follow Us</h3>
                <div className="flex flex-wrap items-center gap-4">
                  {Object.entries(info.socials).map(([key, url]) => {
                    if (!url || (url as string).trim() === "") return null;
                    return (
                      <Link
                        key={key}
                        href={formatExternalLink(url as string)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-secondary/30 text-muted-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                      >
                        {SocialIcons[key as keyof typeof SocialIcons]}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Right Side: Contact Form (Spans 7 columns) */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border rounded-2xl p-6 md:p-10 shadow-xl"
          >
            <h2 className="text-3xl font-medium tracking-tight mb-8">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-bold text-foreground"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="bg-secondary/30 border-border focus-visible:ring-primary h-12 px-4 rounded-lg text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-foreground"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="bg-secondary/30 border-border focus-visible:ring-primary h-12 px-4 rounded-lg text-base"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label
                    htmlFor="phone"
                    className="text-sm font-bold text-foreground"
                  >
                    Mobile Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 00000 00000"
                    className="bg-secondary/30 border-border focus-visible:ring-primary h-12 px-4 rounded-lg text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2.5">
                  <label
                    htmlFor="subject"
                    className="text-sm font-bold text-foreground"
                  >
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="How can we help you?"
                    className="bg-secondary/30 border-border focus-visible:ring-primary h-12 px-4 rounded-lg text-base"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="message"
                  className="text-sm font-bold text-foreground"
                >
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message here..."
                  className="flex min-h-[200px] w-full rounded-lg border border-border bg-secondary/30 px-4 py-4 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-12 px-10 rounded-lg font-bold gap-2 text-base mt-4 shadow-md transition-transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <MoveUpRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
