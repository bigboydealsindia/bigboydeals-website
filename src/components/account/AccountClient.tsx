"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserRound,
  Package,
  ChevronRight,
  LogOut,
  Loader2,
  UserStar, // Admin/Staff icon import kiya
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AccountClient({ user }: { user: any }) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Hello");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // FIX: Using setTimeout to safely update state within useEffect and prevent cascading renders
  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good evening");
      } else {
        setGreeting("Good night");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Failed to log out. Please try again.");
      setIsLoggingOut(false);
    } else {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Greeting Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground capitalize-first">
          {greeting},{" "}
          <span className="text-primary">
            {user?.fullName?.split(" ")[0] || "User"}!
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Manage your account settings and track orders.
        </p>
      </div>

      {/* Menu Cards Container */}
      <div className="bg-background border border-border rounded-md shadow-sm overflow-hidden flex flex-col mb-8">
        {/* Admin/Staff Panel Link (Visible to Admin and Staff) */}
        {(user?.role === "admin" || user?.role === "staff") && (
          <Link
            href="/admin"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/20 transition-colors border-b border-border/50 group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary p-2.5 rounded-md group-hover:scale-105 transition-transform">
                <UserStar size={22} />
              </div>
              <span className="font-bold text-sm sm:text-base text-foreground">
                {user?.role === "staff" ? "Staff Panel" : "Admin Panel"}
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </Link>
        )}

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/20 transition-colors border-b border-border/50 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary p-2.5 rounded-md group-hover:scale-105 transition-transform">
              <UserRound size={22} />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">
              My Profile
            </span>
          </div>
          <ChevronRight
            size={18}
            className="text-muted-foreground group-hover:text-primary transition-colors"
          />
        </Link>

        {/* Orders Link */}
        <Link
          href="/orders"
          className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/20 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary p-2.5 rounded-md group-hover:scale-105 transition-transform">
              <Package size={22} />
            </div>
            <span className="font-bold text-sm sm:text-base text-foreground">
              My Orders
            </span>
          </div>
          <ChevronRight
            size={18}
            className="text-muted-foreground group-hover:text-primary transition-colors"
          />
        </Link>
      </div>

      <Separator className="mb-8" />

      {/* Logout Button */}
      <Button
        variant="outline"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full h-12 rounded-md font-bold text-sm sm:text-base text-red-600 border-red-200 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-300 dark:bg-red-950/10 dark:border-red-900/50 dark:hover:bg-red-900/30 flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        {isLoggingOut ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LogOut size={18} />
        )}
        {isLoggingOut ? "Logging out..." : "Log Out"}
      </Button>
    </div>
  );
}
