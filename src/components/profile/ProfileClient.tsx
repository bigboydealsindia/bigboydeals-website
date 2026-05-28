"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateUserProfileDetails } from "@/app/actions/profile";

interface DBUser {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  role: "admin" | "user";
  createdAt: Date;
}

interface ProfileClientProps {
  user: DBUser;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    streetAddress: user.streetAddress || "",
    city: user.city || "",
    state: user.state || "",
    pincode: user.pincode || "",
  });

  const isAddressEmpty =
    !user.streetAddress || !user.city || !user.state || !user.pincode;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }

    setIsUpdating(true);

    const res = await updateUserProfileDetails({
      fullName: formData.fullName,
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    });

    if (res.success) {
      toast.success("Profile Updated Successfully!");
      setIsEditing(false);
      router.refresh(); // Update server component data
    } else {
      toast.error(res.error || "Something went wrong while updating profile.");
    }

    setIsUpdating(false);
  };

  return (
    <>
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold">My Profile</span>
      </nav>

      {/* 2. Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          My Profile
        </h1>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="edit-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="h-10 px-4 rounded-md flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/10 transition-colors"
              >
                <Edit2 size={16} /> Edit Details
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="action-btns"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <Button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data on cancel
                  setFormData({
                    fullName: user.fullName || "",
                    phone: user.phone || "",
                    streetAddress: user.streetAddress || "",
                    city: user.city || "",
                    state: user.state || "",
                    pincode: user.pincode || "",
                  });
                }}
                variant="ghost"
                disabled={isUpdating}
                className="h-10 rounded-md flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="h-10 rounded-md flex items-center gap-2 px-6 font-bold"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Avatar & Basic Info Card */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-background border border-border shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-extrabold mb-4 shadow-inner">
              {formData.fullName
                ? formData.fullName.charAt(0).toUpperCase()
                : user.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-foreground line-clamp-1">
              {formData.fullName || "User Name"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {user.email}
            </p>
            <div className="mt-4 px-3 py-1 bg-secondary/30 rounded-full text-xs font-semibold text-foreground uppercase tracking-wider">
              {user.role} Account
            </div>
          </div>
        </div>

        {/* Right Side: Details Form / View */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-background border border-border shadow-sm rounded-xl overflow-hidden relative">
            {/* View Mode Overlay (if not editing) */}
            {!isEditing && (
              <div className="absolute inset-0 z-10 bg-transparent" />
            )}

            <div
              className={`p-6 sm:p-8 space-y-8 transition-opacity duration-300 ${!isEditing ? "opacity-90" : "opacity-100"}`}
            >
              {/* Personal Information Section */}
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                  <User size={16} className="text-primary" /> Personal
                  Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Full Name
                    </Label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`h-11 ${!isEditing ? "bg-secondary/10 border-transparent shadow-none" : ""}`}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      value={user.email || ""}
                      className="h-11 bg-secondary/20 border-transparent shadow-none text-muted-foreground cursor-not-allowed"
                      readOnly
                      title="Email cannot be changed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Phone Number
                    </Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter 10 digit phone number"
                      className={`h-11 ${!isEditing ? "bg-secondary/10 border-transparent shadow-none" : ""}`}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                  <MapPin size={16} className="text-primary" /> Delivery Address
                </h3>

                {/* Empty Address Label - Only shows in View Mode if address is missing */}
                {!isEditing && isAddressEmpty && (
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-600 dark:text-amber-500">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      You haven&apos;t provided a complete delivery address yet.
                      Click{" "}
                      <span
                        className="font-bold underline cursor-pointer"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Details
                      </span>{" "}
                      to add your shipping address for a seamless checkout
                      experience.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Street Address / Apartment / Suite
                    </Label>
                    <Input
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Main Street, Apt 4B"
                      className={`h-11 ${!isEditing ? "bg-secondary/10 border-transparent shadow-none" : ""}`}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      City
                    </Label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City Name"
                      className={`h-11 ${!isEditing ? "bg-secondary/10 border-transparent shadow-none" : ""}`}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      State
                    </Label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State Name"
                      className={`h-11 ${!isEditing ? "bg-secondary/10 border-transparent shadow-none" : ""}`}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Pincode
                    </Label>
                    <Input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      className={`h-11 ${!isEditing ? "bg-secondary/10 border-transparent shadow-none" : ""}`}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Country
                    </Label>
                    <Input
                      value="India"
                      className="h-11 bg-secondary/20 border-transparent shadow-none text-muted-foreground cursor-not-allowed font-medium"
                      readOnly
                      title="We currently only deliver within India."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
