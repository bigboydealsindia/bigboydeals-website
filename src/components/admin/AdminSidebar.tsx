"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartArea,
  Settings,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  HandCoins,
  ArrowLeft,
  Layers,
  Tag,
  PackageSearch,
  Timer,
  Star,
  Mail,
  MessageCircleMore,
  TicketPercent,
  ChevronRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogoutDialog } from "@/components/shared/LogoutDialog";

/* eslint-disable @typescript-eslint/no-explicit-any */

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: ChartArea },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Our Brands", href: "/admin/our-brands", icon: Tag },
  { name: "Products", href: "/admin/products", icon: PackageSearch },
  { name: "Deals", href: "/admin/deals", icon: Timer },
  { name: "Orders", href: "/admin/orders", icon: HandCoins },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Messages", href: "/admin/messages", icon: MessageCircleMore },
  { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ user }: { user: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // FIX: Using setTimeout to safely update state within useEffect and prevent cascading renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE VIEW (Top Navbar + Sliding Drawer) - Only on small screens */}
      {/* ======================================================== */}
      <div className="lg:hidden flex items-center justify-between bg-background border-b border-border p-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={24} />
          </button>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Big Boy Deals
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Admin
          </span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dark Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
            />

            {/* Sliding Drawer from Left */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-background flex flex-col z-[110] lg:hidden shadow-2xl overflow-y-auto hide-scrollbar border-r border-border"
            >
              <div className="flex items-center justify-between p-4 h-20 shrink-0 border-b border-border/50">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={120}
                  height={35}
                  className="object-contain"
                />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Sidebar Menu Items */}
              <nav className="flex-1 px-3 space-y-2 mt-4">
                {menuItems.map((item) => {
                  const isActive =
                    item.href === "/admin" || item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="relative block"
                    >
                      <div
                        className={`flex items-center p-3 rounded-[var(--radius)] z-10 relative transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <item.icon size={22} className="shrink-0" />
                        <span className="ml-4 font-medium whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/10 rounded-[var(--radius)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="mt-auto px-3 pb-4">
                <button className="w-full flex items-center p-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-[var(--radius)] transition-colors mb-2">
                  <Bell size={22} className="shrink-0" />
                  <span className="ml-4 font-medium">Notifications</span>
                </button>
                <Separator className="my-4" />
                <div className="flex items-center gap-3 px-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                    {user?.fullName?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-foreground">
                      {user?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Administrator
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-md border-border text-foreground hover:bg-secondary/50 transition-all"
                  >
                    <ArrowLeft size={16} /> Go to Main Page
                  </Button>
                  <div className="p-4 bg-secondary/30 rounded-[var(--radius)] border border-border flex flex-col gap-4 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-full shadow-sm border border-border">
                        <Settings size={18} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          Secure Session
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Admin Access
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowLogoutDialog(true)}
                      variant="outline"
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-md border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                    >
                      <LogOut size={16} /> Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* PC VIEW (Hidden on Mobile) - Exact same as before */}
      {/* ======================================================== */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-background hidden lg:flex flex-col shrink-0 overflow-y-auto hide-scrollbar z-20"
      >
        <div className="flex items-center justify-between p-4 h-20 shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="overflow-hidden"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={120}
                  height={35}
                  className="object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors mx-auto lg:mx-0"
          >
            {isCollapsed ? (
              <PanelLeft size={22} />
            ) : (
              <PanelLeftClose size={22} />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin" || item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link key={item.name} href={item.href} className="relative block">
                <div
                  className={`flex items-center p-3 rounded-[var(--radius)] z-10 relative transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <item.icon size={22} className="shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-4 font-medium whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeAdminNav"
                    className="absolute inset-0 bg-primary/10 rounded-[var(--radius)]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pb-4">
          <button className="w-full flex items-center p-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-[var(--radius)] transition-colors mb-2">
            <Bell size={22} className="shrink-0" />
            {!isCollapsed && (
              <span className="ml-4 font-medium">Notifications</span>
            )}
          </button>
          <Separator className="my-4" />
          <div
            className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "px-3"}`}
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-foreground">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrator
                </p>
              </div>
            )}
          </div>
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 flex flex-col gap-3"
              >
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-md border-border text-foreground hover:bg-secondary/50 transition-all"
                >
                  <ArrowLeft size={16} /> Go to Main Page
                </Button>
                <div className="p-4 bg-secondary/30 rounded-[var(--radius)] border border-border flex flex-col gap-4 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-full shadow-sm border border-border">
                      <Settings size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        Secure Session
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Admin Access
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowLogoutDialog(true)}
                    variant="outline"
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-md border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                  >
                    <LogOut size={16} /> Sign Out
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="mt-6 flex flex-col gap-4 items-center">
                <button
                  onClick={() => router.push("/")}
                  className="p-3 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
                >
                  <ArrowLeft size={22} />
                </button>
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="p-3 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                >
                  <LogOut size={22} />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
    </>
  );
}
