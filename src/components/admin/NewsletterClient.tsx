"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Copy,
  Check,
  MailOpen,
  Loader2,
  CheckSquare,
  Square,
  User,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { markNewslettersAsRead } from "@/app/actions/newsletter";

interface Subscriber {
  id: number;
  whatsappNumber: string;
  isRead: boolean;
  createdAt: Date;
  userName: string | null;
  loginEmail: string | null;
  phone: string | null;
}

interface NewsletterClientProps {
  initialData: Subscriber[];
}

export function NewsletterClient({ initialData }: NewsletterClientProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const sortedSubscribers = [...subscribers].sort((a, b) => {
    if (a.isRead === b.isRead) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isRead ? 1 : -1;
  });

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === unreadSubscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unreadSubscribers.map((sub) => sub.id));
    }
  };

  const unreadSubscribers = subscribers.filter((sub) => !sub.isRead);

  const handleCopy = (number: string, id: number) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    toast.success("Number Copied!", {
      description: `${number} copied to clipboard.`,
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0) return;

    setIsUpdating(true);
    const res = await markNewslettersAsRead(selectedIds);

    if (res.success) {
      toast.success("Updated successfully", {
        description: `${selectedIds.length} subscriptions marked as read.`,
      });

      setSubscribers((prev) =>
        prev.map((sub) =>
          selectedIds.includes(sub.id) ? { ...sub, isRead: true } : sub,
        ),
      );
      setSelectedIds([]);
    } else {
      toast.error("Failed to update", { description: "Something went wrong." });
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            WhatsApp Subscribers
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage users who opted in for WhatsApp marketing.
          </p>
        </div>
        <Button
          onClick={handleMarkAsRead}
          disabled={selectedIds.length === 0 || isUpdating}
          className="rounded-md gap-2 h-10 px-6 font-semibold transition-all bg-green-600 hover:bg-green-700 text-white"
        >
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <MailOpen size={16} />
          )}
          Mark as Read ({selectedIds.length})
        </Button>
      </div>

      <Separator />

      <div className="rounded-md border border-border overflow-hidden bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="h-12 px-4 align-middle font-medium w-[50px]">
                  <button
                    onClick={toggleAll}
                    disabled={unreadSubscribers.length === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {selectedIds.length > 0 &&
                    selectedIds.length === unreadSubscribers.length ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="h-12 px-4 align-middle font-medium">
                  Customer Details
                </th>
                <th className="h-12 px-4 align-middle font-medium">
                  WhatsApp Number
                </th>
                <th className="h-12 px-4 align-middle font-medium text-right">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {sortedSubscribers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No subscribers found.
                    </td>
                  </tr>
                ) : (
                  sortedSubscribers.map((sub) => {
                    const isSelected = selectedIds.includes(sub.id);

                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={sub.id}
                        className={`border-b border-border/50 hover:bg-secondary/10 transition-colors ${
                          sub.isRead
                            ? "opacity-70 bg-secondary/5"
                            : "bg-background"
                        }`}
                      >
                        <td className="p-4 align-middle">
                          {!sub.isRead ? (
                            <button
                              onClick={() => toggleSelection(sub.id)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare
                                  size={18}
                                  className="text-primary"
                                />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          ) : (
                            <Check
                              size={18}
                              className="text-muted-foreground/30"
                            />
                          )}
                        </td>

                        <td className="p-4 align-middle">
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <User
                                size={14}
                                className="text-muted-foreground"
                              />
                              {sub.userName || "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                              <Mail size={12} />
                              {sub.loginEmail || "No login email"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                              <Phone size={12} />
                              {sub.phone || "No phone provided"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold flex items-center gap-2 ${!sub.isRead ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              <MessageCircle
                                size={14}
                                className={
                                  !sub.isRead
                                    ? "text-green-500"
                                    : "text-muted-foreground"
                                }
                              />
                              {sub.whatsappNumber}
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(sub.whatsappNumber, sub.id)
                              }
                              className="p-1.5 bg-secondary/50 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-colors"
                              title="Copy Number"
                            >
                              {copiedId === sub.id ? (
                                <Check size={14} className="text-green-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-4 align-middle text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sub.isRead
                                ? "bg-secondary text-muted-foreground"
                                : "bg-green-500/10 text-green-600 border border-green-500/20"
                            }`}
                          >
                            {sub.isRead ? "Reviewed" : "New Entry"}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
