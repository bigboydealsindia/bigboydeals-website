"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MarqueeBanner } from "@/components/shared/MarqueeBanner";
import { useMarqueeStore } from "@/store/useMarqueeStore";
import {
  updateMarqueeSettings,
  getStoreSettings,
} from "@/app/actions/settings";

export default function MarqueeSettingsPage() {
  const { items, isActive, isLoaded, setMarquee } = useMarqueeStore();

  // Loading state for save operations
  const [isSaving, setIsSaving] = useState(false);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Data States
  const [newText, setNewText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoaded) {
        const settings = await getStoreSettings();
        setMarquee(settings.marqueeTexts, settings.isMarqueeActive);
      }
    };
    loadSettings();
  }, [isLoaded, setMarquee]);

  // Sync with DB and Store
  const saveToDatabase = async (
    newItems: string[],
    newActiveState: boolean,
  ) => {
    setIsSaving(true);
    try {
      await updateMarqueeSettings(newItems, newActiveState);
      setMarquee(newItems, newActiveState);
      return true;
    } catch (error) {
      toast.error("Failed to save changes", {
        description: "Please check your connection and try again.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Visibility
  const handleToggle = async (checked: boolean) => {
    const success = await saveToDatabase(items, checked);
    if (success) {
      if (checked) {
        toast.success("Marquee enabled", {
          description: "The announcement bar is now visible on the storefront.",
        });
      } else {
        toast.info("Marquee disabled", {
          description:
            "The announcement bar has been hidden from the storefront.",
        });
      }
    }
  };

  // Open Dialog for Adding
  const openAddDialog = () => {
    setNewText("");
    setEditIndex(null);
    setIsDialogOpen(true);
  };

  // Open Dialog for Editing
  const openEditDialog = (index: number, text: string) => {
    setNewText(text);
    setEditIndex(index);
    setIsDialogOpen(true);
  };

  // Handle Submit (Add or Edit)
  const handleSubmit = async () => {
    if (!newText.trim()) return;

    let updatedItems = [...items];

    if (editIndex !== null) {
      updatedItems[editIndex] = newText;
      const success = await saveToDatabase(updatedItems, isActive);
      if (success) {
        toast.success("Announcement updated", {
          description: "Your changes have been saved and applied globally.",
        });
      }
    } else {
      updatedItems.push(newText);
      const success = await saveToDatabase(updatedItems, isActive);
      if (success) {
        toast.success("Announcement added", {
          description: "Your new text is now in the rotation.",
        });
      }
    }

    setNewText("");
    setEditIndex(null);
    setIsDialogOpen(false);
  };

  // Open Delete Alert
  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (deleteIndex !== null) {
      const updatedItems = items.filter((_, index) => index !== deleteIndex);
      const success = await saveToDatabase(updatedItems, isActive);

      if (success) {
        toast.success("Announcement deleted", {
          description: "The text has been permanently removed.",
        });
      }
    }
    setDeleteIndex(null);
    setIsDeleteDialogOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Announcement Bar
          </h2>
          <p className="text-muted-foreground mt-1">
            Control the promotional messages scrolling across your store.
          </p>
        </div>

        <Button
          onClick={openAddDialog}
          className="rounded-md gap-2 h-10 px-5"
          disabled={isSaving}
        >
          <Plus size={16} /> Add New
        </Button>
      </div>

      {/* Main Content Split Area */}
      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Left Side: Active Texts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-lg font-semibold">Active Messages</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {isActive ? "Visible" : "Hidden"}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-3 min-h-[200px]">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-[var(--radius)] border border-border text-center"
                >
                  Your banner is currently empty. Add a message to display it on
                  the store.
                </motion.div>
              ) : (
                items.map((item, idx) => (
                  <motion.div
                    key={`${item}-${idx}`} // Unique key for animation tracking
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center p-3 sm:p-4 bg-secondary/20 border border-border rounded-[var(--radius)] group"
                  >
                    <span className="text-sm font-medium flex-1 pr-4 break-words">
                      {item}
                    </span>

                    {/* Actions Area */}
                    <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditDialog(idx, item)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10"
                        disabled={isSaving}
                      >
                        <Pencil size={16} />
                      </button>

                      <Separator orientation="vertical" className="h-4" />

                      <button
                        onClick={() => confirmDelete(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                        disabled={isSaving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Live Browser Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">
            Live Preview
          </h3>
          <div
            className="border border-border rounded-[var(--radius)] overflow-hidden shadow-sm transition-opacity duration-300"
            style={{ opacity: isActive ? 1 : 0.5 }}
          >
            {/* Mock Browser Header */}
            <div className="h-10 bg-secondary/50 border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
            </div>

            {/* Website Mock Body */}
            <div className="bg-background relative flex flex-col h-48 overflow-hidden">
              {isActive && items.length > 0 && <MarqueeBanner items={items} />}

              <div className="flex-1 flex items-center justify-center">
                <span className="text-muted-foreground/50 font-medium text-sm">
                  {isActive ? "Store Content Area" : "Marquee is hidden"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[var(--radius)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editIndex !== null ? "Update Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Keep it engaging. This text will scroll at the top of your
              website.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Type your message here..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="h-12 rounded-md"
              autoFocus
              disabled={isSaving}
            />
          </div>
          <DialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-md m-0"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-md m-0"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : editIndex !== null ? (
                "Save Changes"
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-[var(--radius)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete this text?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              This action cannot be undone. The announcement will be removed
              from your storefront immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md m-0"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-md m-0"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
