"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Agar page popup ke andar open hua hai, toh us popup ko band karo
    // aur main window ko signal bhej do refresh hone ke liye
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(
        "oauth_callback_success",
        window.location.origin,
      );
      window.close();
    } else {
      // Agar direct browser URL pe aaya hai toh bas home par bhej do
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium">Verifying your secure login...</p>
      </div>
    </div>
  );
}
