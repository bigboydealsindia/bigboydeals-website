"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
} from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let res: any;

    if (isLogin) {
      res = await signInWithEmail(formData);
    } else {
      res = await signUpWithEmail(formData);
    }

    if (res?.success) {
      if (isLogin) {
        toast.success("Access granted", {
          description: "Loading your dashboard and the latest drops.",
        });
      } else {
        toast.success("Welcome to the roster", {
          description: "Your account is live. Time to find some great deals.",
        });
      }
      router.push("/");
    } else {
      toast.error("Wait a second", {
        description:
          res?.error ||
          "We could not verify those details. Give it another shot.",
      });

      if (res?.needsSignup) {
        setTimeout(() => {
          setIsLogin(false);
        }, 800);
      }

      setLoading(false);
    }
  };

  // NAYA FIX: Google OAuth Popup Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    const res = await signInWithGoogle();

    if (res?.success && res.url) {
      // Calculate center position for the popup
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2 + window.screenX;
      const top = (window.innerHeight - height) / 2 + window.screenY;

      // Open Google Login in a small, clean popup window
      window.open(
        res.url,
        "Google Login",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      );

      // Listen for the callback from the popup to refresh the page
      window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data === "oauth_callback_success") {
          router.push("/");
        }
      });

      // Stop loading after a brief moment since auth happens in popup
      setTimeout(() => setLoading(false), 2000);
    } else {
      toast.error("Google Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      {/* Left Side - Visual / Image Area */}
      <div className="hidden lg:block p-4 h-screen">
        <div className="relative h-full w-full rounded-[var(--radius)] overflow-hidden bg-muted">
          <Image
            src="/login-bg.jpg"
            alt="Premium shopping experience"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute top-8 left-8">
            {!logoError ? (
              <Image
                src="/logo.png"
                alt="BigBoyDeals Logo"
                width={150}
                height={40}
                onError={() => setLogoError(true)}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Big Boy Deals
              </span>
            )}
          </div>

          <div className="absolute bottom-12 left-8 right-8 text-white space-y-3">
            <h2 className="text-3xl font-bold leading-tight">
              Premium gear for the modern lifestyle
            </h2>
            <p className="text-white/80 text-lg max-w-lg">
              Discover curated collections crafted for quality and style. Your
              next favorite upgrade is just a click away.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="flex items-center justify-center p-8 sm:p-12 h-screen overflow-y-auto bg-background">
        <div className="w-full max-w-[400px]">
          <div className="space-y-2 text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Claim your spot"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Enter your details to access your account."
                : "Drop your details below and start exploring."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="fullName">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                      className="h-12 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="phone">
                      Mobile Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your mobile number"
                      required
                      disabled={loading}
                      className="h-12 rounded-md"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className="h-12 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:underline"
                      onClick={() =>
                        toast.info("Recovery link sent", {
                          description:
                            "Check your inbox for further instructions.",
                        })
                      }
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                    disabled={loading}
                    className="h-12 rounded-md pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium rounded-md"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="flex items-center gap-4 my-8">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          {/* FIX: Replaced form action with onClick popup handler */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium rounded-md"
            disabled={loading}
          >
            <svg
              viewBox="0 0 24 24"
              className="mr-3 h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </Button>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "New around here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-primary hover:underline transition-all"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
