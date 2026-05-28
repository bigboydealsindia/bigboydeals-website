"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MapPin,
  Mail,
  Phone,
  Map,
  AtSign,
  Link2,
  Loader2,
  Contact2,
} from "lucide-react";

import { getContactInfo, updateContactInfo } from "@/app/actions/contact";

// Social SVG Icons (Standalone to avoid Lucide import errors)
const SocialIcons = {
  facebook: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-600"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-pink-600"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  youtube: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-600"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  ),
  twitter: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-sky-500"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  ),
  linkedin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-700"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
};

interface ContactData {
  address: string;
  email: string;
  additionalEmail: string;
  phone: string;
  additionalPhone: string;
  mapSrc: string;
  socials: {
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
    threads: string;
    linkedin: string;
    url: string;
  };
}

const defaultData: ContactData = {
  address: "123 Fashion Street, Sector 4, New Delhi, India - 110001",
  email: "support@bigboydeals.com",
  additionalEmail: "",
  phone: "+91 98765 43210",
  additionalPhone: "",
  mapSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754720611!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  socials: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    threads: "",
    linkedin: "",
    url: "",
  },
};

export default function ContactInfoPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<ContactData>(defaultData);
  const [formData, setFormData] = useState<ContactData>(defaultData);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await getContactInfo();
      if (data) {
        setOriginalData(data as ContactData);
        setFormData(data as ContactData);
      }
      setIsLoaded(true);
    };
    fetchInfo();
  }, []);

  const hasChanges = useMemo(
    () => JSON.stringify(originalData) !== JSON.stringify(formData),
    [originalData, formData],
  );

  const handleAction = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    if (
      !formData.address ||
      !formData.email ||
      !formData.phone ||
      !formData.mapSrc
    ) {
      toast.error("Required fields missing");
      return;
    }

    setIsSaving(true);
    const res = await updateContactInfo(formData);
    if (res.success) {
      toast.success("Information Updated");
      setOriginalData(formData);
      setIsEditing(false);
    } else {
      toast.error("Update Failed");
    }
    setIsSaving(false);
  };

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Contact Informations
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage public contact details and social links.
          </p>
        </div>
        <Button
          onClick={handleAction}
          disabled={isSaving}
          className="rounded-md h-10 px-6 min-w-[140px]"
          variant={isEditing && !hasChanges ? "outline" : "default"}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isEditing ? (
            hasChanges ? (
              "Save Changes"
            ) : (
              "Cancel"
            )
          ) : (
            "Edit Details"
          )}
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Core Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary/10 border p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <MapPin size={16} className="text-primary" /> Full Address *
              </div>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, address: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="bg-secondary/10 border p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Map size={16} className="text-primary" /> Map SRC *
              </div>
              <Input
                value={formData.mapSrc}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, mapSrc: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="bg-secondary/10 border p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Mail size={16} className="text-primary" /> Primary Email *
              </div>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="bg-secondary/10 border p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Mail size={16} /> Additional Email
              </div>
              <Input
                value={formData.additionalEmail}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    additionalEmail: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="bg-secondary/10 border p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Phone size={16} className="text-primary" /> Phone Number *
              </div>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className="bg-secondary/10 border p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Phone size={16} /> Additional Phone
              </div>
              <Input
                value={formData.additionalPhone}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    additionalPhone: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold">Social Media Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SocialIcons).map(([key, icon]) => (
              <div
                key={key}
                className="bg-secondary/10 border p-4 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm capitalize">
                  {icon} {key}
                </div>
                <Input
                  value={formData.socials[key as keyof ContactData["socials"]]}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      socials: { ...p.socials, [key]: e.target.value },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
