"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MessageCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function NewsletterSection() {
  const router = useRouter();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Phone Validation Regex (10 to 15 digits)
  const validatePhone = (phone: string) => {
    const re = /^\+?[0-9]{10,15}$/;
    return re.test(String(phone).trim());
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      toast.error("Number required", {
        description: "Please enter your WhatsApp number.",
      });
      return;
    }

    if (!validatePhone(whatsappNumber)) {
      toast.error("Invalid Number", {
        description: "Please enter a valid 10-digit WhatsApp number.",
      });
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAuthDialogOpen(true);
      setIsSubmitting(false);
      return;
    }

    const res = await subscribeToNewsletter(session.user.id, whatsappNumber);

    if (res.success) {
      toast.success("Subscribed Successfully!", {
        description:
          "Welcome to our inner circle. Expect great WhatsApp deals soon.",
      });
      setWhatsappNumber(""); // Form clear kar do
    } else {
      toast.error("Subscription Failed", {
        description: res.error || "Could not complete the process.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[400px] md:min-h-[450px]">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/newsletter-bg.mp4"
          />

          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center text-center"
          >
            <div className="p-3 bg-green-500/20 backdrop-blur-md rounded-full mb-6 border border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <MessageCircle size={28} />
            </div>

            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-4">
              Get WhatsApp Updates
            </h2>

            <p className="text-sm md:text-base text-gray-300 mb-8 max-w-lg">
              Get the latest updates on new arrivals, exclusive discounts, and
              special offers delivered directly to your WhatsApp.
            </p>

            {/* Input & Floating Button */}
            <form
              onSubmit={handleSubscribe}
              className="w-full relative flex items-center bg-background rounded-lg p-1.5 shadow-xl border border-border"
            >
              <span className="pl-4 font-semibold text-muted-foreground border-r border-border pr-3">
                +91
              </span>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Enter your WhatsApp number..."
                disabled={isSubmitting}
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm md:text-base text-foreground placeholder:text-muted-foreground w-full"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md h-10 px-5 md:px-8 font-bold shadow-sm ml-2 shrink-0 transition-transform active:scale-95 bg-green-600 hover:bg-green-700 text-white border border-green-500"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span className="hidden md:inline">Subscribe</span>
                    <Send size={16} className="md:hidden" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Required Auth Dialog */}
      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <AlertDialogContent className="rounded-[var(--radius)] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl flex items-center gap-2">
              Authentication Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
              You must be logged into your account to subscribe to our WhatsApp
              updates and receive personalized offers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setAuthDialogOpen(false)}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="rounded-md m-0"
            >
              Login Now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
