"use client";

import { useState, useMemo } from "react";
import { Loader2, BellRing, Bot, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateTelegramSettings } from "@/app/actions/telegram";

interface NotificationData {
  botToken: string;
  chatId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NotificationsClient({
  initialSettings,
}: {
  initialSettings: any;
}) {
  const defaultData: NotificationData = {
    botToken: initialSettings?.botToken || "",
    chatId: initialSettings?.chatId || "",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] =
    useState<NotificationData>(defaultData);
  const [formData, setFormData] = useState<NotificationData>(defaultData);

  const hasChanges = useMemo(
    () => JSON.stringify(originalData) !== JSON.stringify(formData),
    [originalData, formData],
  );

  const handleAction = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // If Editing is true but no changes made, behave like Cancel button
    if (!hasChanges) {
      setFormData(originalData); // Reset form
      setIsEditing(false);
      return;
    }

    // Save Logic
    if (!formData.botToken.trim() || !formData.chatId.trim()) {
      toast.error("Both fields are required");
      return;
    }

    setIsSaving(true);
    const res = await updateTelegramSettings(formData);

    if (res.success) {
      toast.success("Telegram Settings Updated");
      setOriginalData(formData);
      setIsEditing(false);
    } else {
      toast.error(res.error || "Update Failed");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header aligned exactly like contact-info page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Notification Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure Telegram Bot to receive real-time updates.
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

      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <BellRing size={20} className="text-primary" /> Telegram Bot
          Configuration
        </h3>

        {/* Input fields matching the contact-info grid UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary/10 border p-4 rounded-md space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Key size={16} className="text-primary" /> Bot Token *
            </div>
            <Input
              placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={formData.botToken}
              onChange={(e) =>
                setFormData((p) => ({ ...p, botToken: e.target.value }))
              }
              disabled={!isEditing}
              className="font-mono text-sm placeholder:font-sans rounded-md"
            />
          </div>

          <div className="bg-secondary/10 border p-4 rounded-md space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Bot size={16} className="text-primary" /> Chat ID / User ID *
            </div>
            <Input
              placeholder="e.g. 987654321"
              value={formData.chatId}
              onChange={(e) =>
                setFormData((p) => ({ ...p, chatId: e.target.value }))
              }
              disabled={!isEditing}
              className="font-mono text-sm placeholder:font-sans rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
