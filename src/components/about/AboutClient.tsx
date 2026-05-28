"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  Target,
  ShieldCheck,
  Truck,
  Quote,
  Users,
  Sparkles,
  Star,
  Headset,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Custom Animated Counter Component
const AnimatedCounter = ({
  to,
  duration = 2,
  suffix = "",
  isDecimal = false,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  isDecimal?: boolean;
}) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (inView) {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / (duration * 1000), 1);
        setCount(progress * to);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, to, duration]);

  const displayCount = isDecimal ? count.toFixed(1) : Math.floor(count);

  return (
    <span ref={nodeRef}>
      {displayCount}
      {suffix}
    </span>
  );
};

// Custom Accordion Component for FAQs
const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border/60 rounded-xl mb-3 bg-secondary/5 overflow-hidden transition-colors hover:bg-secondary/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 md:p-5 font-bold text-left text-foreground focus:outline-none"
      >
        <span className="text-sm pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 md:px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function AboutClient() {
  const faqs = [
    {
      question: "How do you ensure the quality of your products?",
      answer:
        "We partner directly with verified manufacturers and authorized distributors. Before any item reaches our warehouse, it goes through a strict quality check to make sure you get exactly what you paid for.",
    },
    {
      question: "What happens if I receive a damaged or wrong item?",
      answer:
        "Your satisfaction is our priority. If you receive a damaged or incorrect item, just contact our support team within 48 hours of delivery. We will arrange a free return and send you a replacement or a full refund.",
    },
    {
      question: "How long does shipping usually take?",
      answer:
        "Most orders are packed and shipped within 24 hours. Depending on your location, standard delivery takes about 3 to 5 business days.",
    },
    {
      question: "Are my payment details secure on this website?",
      answer:
        "Absolutely. We use industry-standard encryption and trusted payment gateways like Razorpay. We do not store your credit card or UPI details on our servers.",
    },
    {
      question: "Can I cancel my order after placing it?",
      answer:
        "Yes, you can cancel your order as long as it hasn't been shipped yet. Once the order leaves our warehouse, you will need to follow our standard return process.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Currently, we only ship within India. We are working hard to expand our delivery network and hope to serve international customers very soon.",
    },
  ];

  // Split FAQs for 2-column layout
  const midPoint = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, midPoint);
  const rightFaqs = faqs.slice(midPoint);

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 md:py-10 min-h-screen">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold truncate">About Us</span>
      </nav>

      {/* 2. Heading & Paragraph */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          About Big Boy Deals
        </h1>
        <p className="text-base text-muted-foreground mt-3 max-w-3xl leading-relaxed">
          We bridge the gap between top-tier quality and everyday affordability.
          Discover our journey, our vision, and the values that drive us to
          bring you the best deals every single day.
        </p>
      </div>

      <Separator className="mb-12" />

      {/* 3. Founder Section (Left Speech, Right Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
        {/* Left: Speech */}
        <div className="space-y-6 order-2 lg:order-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            The Vision Behind the Brand
          </h2>

          <div className="bg-secondary/10 border border-border/50 rounded-2xl p-6 md:p-8 relative">
            <Quote
              className="absolute top-6 left-6 text-primary/10"
              size={60}
            />
            <div className="relative z-10 space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed mt-2 italic">
              <p>
                "When I launched this platform, I noticed how hard it was to
                find a store that offered great products without adding massive
                retail markups. I wanted to create a place where I would
                personally love to shop."
              </p>
              <p>
                "We don't just sell products; we build relationships. Every
                single item listed on our site passes through careful curation.
                My promise to you is simple: if a product isn't good enough for
                my family, it won't be sold to yours."
              </p>
            </div>
          </div>

          <Separator className="w-1/2" />

          <div>
            <h3 className="text-lg font-bold text-foreground">Deepak Kumar</h3>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              Founder, Big Boy Deals
            </p>
          </div>
        </div>

        {/* Right: Image */}
        <div className="order-1 lg:order-2 w-full">
          <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden shadow-sm border border-border">
            <Image
              src="/placeholder-founder.jpg"
              alt="Founder of Big Boy Deals"
              fill
              className="object-cover bg-secondary"
            />
          </div>
        </div>
      </div>

      {/* 4. Why Choose Us Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-secondary/10 border border-border rounded-2xl p-6 flex flex-col items-start space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl mb-1">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Curated Selection
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We cut through the noise and only list items that meet our high
              standards for design, durability, and absolute utility.
            </p>
          </div>

          <div className="bg-secondary/10 border border-border rounded-2xl p-6 flex flex-col items-start space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl mb-1">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Secure Shopping
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your privacy and security matter. Our checkout process is 100%
              secure with verified and trusted payment partners.
            </p>
          </div>

          <div className="bg-secondary/10 border border-border rounded-2xl p-6 flex flex-col items-start space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl mb-1">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nobody likes waiting. We partner with the best courier services to
              make sure your order reaches you strictly on time.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Animated Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
        <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Users size={24} className="mx-auto text-muted-foreground mb-2" />
          <div className="text-2xl md:text-3xl font-extrabold text-foreground">
            <AnimatedCounter to={5000} suffix="+" />
          </div>
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Happy Customers
          </p>
        </div>

        <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Sparkles size={24} className="mx-auto text-muted-foreground mb-2" />
          <div className="text-2xl md:text-3xl font-extrabold text-foreground">
            <AnimatedCounter to={500} suffix="+" />
          </div>
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Unique Designs
          </p>
        </div>

        <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Star size={24} className="mx-auto text-yellow-500 mb-2" />
          <div className="text-2xl md:text-3xl font-extrabold text-foreground">
            <AnimatedCounter to={4.9} isDecimal={true} />
          </div>
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Average Rating
          </p>
        </div>

        <div className="bg-background border border-border rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Headset size={24} className="mx-auto text-muted-foreground mb-2" />
          <div className="text-2xl md:text-3xl font-extrabold text-foreground">
            24/7
          </div>
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Customer Support
          </p>
        </div>
      </div>

      {/* 6. FAQs Section (2 Columns) */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
          <div className="space-y-1">
            {leftFaqs.map((faq, index) => (
              <FaqItem
                key={`left-${index}`}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
          <div className="space-y-1">
            {rightFaqs.map((faq, index) => (
              <FaqItem
                key={`right-${index}`}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
