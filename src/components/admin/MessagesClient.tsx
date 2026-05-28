"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  MailOpen,
  Loader2,
  CheckSquare,
  Square,
  User,
  Phone,
  Mail,
  Eye,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { markMessagesAsRead } from "@/app/actions/contact-messages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Message {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface MessagesClientProps {
  initialData: Message[];
}

export function MessagesClient({ initialData }: MessagesClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // State for reading full message
  const [viewMessage, setViewMessage] = useState<Message | null>(null);

  // Sort: Unread first, then newest
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.isRead === b.isRead) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isRead ? 1 : -1;
  });

  const unreadMessages = messages.filter((m) => !m.isRead);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (
      selectedIds.length === unreadMessages.length &&
      unreadMessages.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unreadMessages.map((m) => m.id));
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0) return;

    setIsUpdating(true);
    const res = await markMessagesAsRead(selectedIds);

    if (res.success) {
      toast.success("Updated successfully", {
        description: `${selectedIds.length} messages marked as read.`,
      });

      setMessages((prev) =>
        prev.map((m) =>
          selectedIds.includes(m.id) ? { ...m, isRead: true } : m,
        ),
      );
      setSelectedIds([]);
    } else {
      toast.error("Failed to update", { description: "Something went wrong." });
    }
    setIsUpdating(false);
  };

  const handleViewMessage = async (msg: Message) => {
    setViewMessage(msg);
    // Auto mark as read when viewed individually
    if (!msg.isRead) {
      await markMessagesAsRead([msg.id]);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)),
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground mt-1">
            Review and respond to customer inquiries from the storefront.
          </p>
        </div>
        <Button
          onClick={handleMarkAsRead}
          disabled={selectedIds.length === 0 || isUpdating}
          className="rounded-md gap-2 h-10 px-6 font-semibold transition-all"
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

      {/* Table Section */}
      <div className="rounded-md border border-border overflow-hidden bg-background shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="h-12 px-4 align-middle font-medium w-[50px]">
                  <button
                    onClick={toggleAll}
                    disabled={unreadMessages.length === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {selectedIds.length > 0 &&
                    selectedIds.length === unreadMessages.length ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="h-12 px-4 align-middle font-medium min-w-[200px]">
                  Customer Details
                </th>
                <th className="h-12 px-4 align-middle font-medium min-w-[250px]">
                  Subject & Message
                </th>
                <th className="h-12 px-4 align-middle font-medium w-[120px]">
                  Date
                </th>
                <th className="h-12 px-4 align-middle font-medium text-right w-[150px]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {sortedMessages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  sortedMessages.map((msg) => {
                    const isSelected = selectedIds.includes(msg.id);

                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={msg.id}
                        className={`border-b border-border/50 hover:bg-secondary/10 transition-colors ${
                          msg.isRead
                            ? "opacity-70 bg-secondary/5"
                            : "bg-background font-medium"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 align-middle">
                          {!msg.isRead ? (
                            <button
                              onClick={() => toggleSelection(msg.id)}
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

                        {/* Customer Info */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <User
                                size={14}
                                className="text-muted-foreground"
                              />
                              {msg.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                              <Mail size={12} />
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-2">
                                <Phone size={12} />
                                {msg.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Message Snippet */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span
                              className={`line-clamp-1 ${!msg.isRead ? "text-foreground font-semibold" : "text-foreground"}`}
                            >
                              {msg.subject}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {msg.message}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 align-middle text-muted-foreground text-xs">
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-middle text-right">
                          <Button
                            variant={msg.isRead ? "outline" : "default"}
                            size="sm"
                            className="h-8 gap-1.5 rounded-md"
                            onClick={() => handleViewMessage(msg)}
                          >
                            <Eye size={14} /> Read
                          </Button>
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

      {/* Full Message View Dialog */}
      <Dialog
        open={!!viewMessage}
        onOpenChange={(open) => !open && setViewMessage(null)}
      >
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl border-b pb-4">
              <MessageSquareText className="text-primary" /> Message Details
            </DialogTitle>
            <DialogDescription className="hidden">
              Detailed view of customer message
            </DialogDescription>
          </DialogHeader>

          {viewMessage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-lg border border-border/50">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    From
                  </span>
                  <div className="font-medium text-foreground">
                    {viewMessage.fullName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {viewMessage.email}
                  </div>
                  {viewMessage.phone && (
                    <div className="text-sm text-muted-foreground">
                      {viewMessage.phone}
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Received On
                  </span>
                  <div className="font-medium text-foreground flex items-center justify-end gap-1.5">
                    <CalendarDays size={14} />
                    {new Date(viewMessage.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">{viewMessage.subject}</h3>
                <div className="bg-background border border-border p-4 rounded-lg text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
                  {viewMessage.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
