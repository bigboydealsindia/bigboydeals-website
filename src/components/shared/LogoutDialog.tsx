"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Server action call (ab ye fail nahi hoga)
    await signOut();

    toast.success("Session ended", {
      description: "You have been securely logged out. Catch you later!",
    });

    // Dialog close karo aur manually redirect karo
    onOpenChange(false);
    setIsLoggingOut(false);

    router.push("/login");
    router.refresh(); // UI aur session state update karne ke liye
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[var(--radius)] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            Heading out?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground mt-2">
            You are about to securely end your current session. We will keep
            everything saved right where you left it for your next visit.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* FIX: "flex flex-row justify-end gap-3" add kiya hai taaki buttons chipke nahi */}
        <AlertDialogFooter className="mt-6 flex flex-row justify-end gap-3 sm:space-x-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut}
            className="rounded-md m-0"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md m-0"
          >
            {isLoggingOut ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Logging out...
              </span>
            ) : (
              "Yes, Logout"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
