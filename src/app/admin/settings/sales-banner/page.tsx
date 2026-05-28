"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";

import { useSalesBannerStore } from "@/store/useSalesBannerStore";
import { getStoreSettings, uploadAssetToStorage } from "@/app/actions/settings";
import { updateSalesBannersSettings } from "@/app/actions/sales-banner";

export default function SalesBannerPage() {
  const { banners, isLoaded, setBanners } = useSalesBannerStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });

  const [activeFileUrl, setActiveFileUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePath, setActivePath] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoaded) {
        const settings = await getStoreSettings();
        setBanners(settings.salesBanners || []);
      }
    };
    loadSettings();
  }, [isLoaded, setBanners]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format", {
        description: "Please upload an image file.",
      });
      return;
    }

    setSelectedFile(file);
    setActiveFileUrl(URL.createObjectURL(file));
  };

  const openDialog = (editItem?: {
    id: string;
    fileUrl: string;
    path: string;
  }) => {
    setSelectedFile(null);
    if (editItem) {
      setEditId(editItem.id);
      setActiveFileUrl(editItem.fileUrl);
      setActivePath(editItem.path);
    } else {
      setEditId(null);
      setActiveFileUrl("");
      setActivePath("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!activeFileUrl && !selectedFile) {
      toast.error("Graphic required", {
        description: "Please upload a promotional image for this banner.",
      });
      return;
    }

    setIsSaving(true);
    let finalUrl = activeFileUrl;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await uploadAssetToStorage(formData);
      if (!uploadRes.success) {
        toast.error("Upload failed", {
          description: uploadRes.error || "Could not process image.",
        });
        setIsSaving(false);
        return;
      }
      finalUrl = uploadRes.url || "";
    }

    let updatedBanners = [...banners];
    if (editId) {
      updatedBanners = updatedBanners.map((b) =>
        b.id === editId ? { ...b, fileUrl: finalUrl, path: activePath } : b,
      );
    } else {
      updatedBanners.push({
        id: Math.random().toString(36).substring(7),
        fileUrl: finalUrl,
        path: activePath,
      });
    }

    const saveRes = await updateSalesBannersSettings(updatedBanners);

    if (saveRes.success) {
      setBanners(updatedBanners);
      toast.success(editId ? "Banner updated" : "Banner published", {
        description: "Changes are now live on the storefront.",
      });
      setIsDialogOpen(false);
    } else {
      toast.error("Save failed", {
        description: "Database sync encountered an error.",
      });
    }
    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteAlert.id) return;

    setIsSaving(true);
    const updatedBanners = banners.filter((b) => b.id !== deleteAlert.id);

    const saveRes = await updateSalesBannersSettings(updatedBanners);

    if (saveRes.success) {
      setBanners(updatedBanners);
      toast.success("Banner removed", {
        description: "The graphic has been permanently deleted.",
      });
    }

    setDeleteAlert({ open: false });
    setIsSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Banner</h2>
          <p className="text-muted-foreground mt-1">
            Display promotional banners between product sections to drive
            conversions.
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="rounded-md gap-2 h-10 px-6"
          disabled={isSaving}
        >
          <Plus size={16} /> Add Banner
        </Button>
      </div>

      <Separator />

      <div className="grid xl:grid-cols-12 gap-8 mt-8">
        {/* Left Side: Active Banners */}
        <div className="xl:col-span-5 space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">
            Active Sales Banners
          </h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {banners.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-[var(--radius)] border border-border text-center"
                >
                  No promotional banners currently active.
                </motion.div>
              ) : (
                banners.map((banner) => (
                  <motion.div
                    layout
                    key={banner.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center p-3 bg-secondary/20 border border-border rounded-[var(--radius)] group"
                  >
                    {/* FIX 1: Portrait thumbnail card */}
                    <div className="h-16 w-12 bg-background rounded-md overflow-hidden shrink-0 relative border border-border shadow-sm">
                      <Image
                        src={banner.fileUrl}
                        alt="Sales banner thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate text-foreground">
                        Promo Graphic
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        /{banner.path || "home"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 px-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openDialog(banner)}
                        className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteAlert({
                            open: true,
                            id: banner.id,
                          })
                        }
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
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

        {/* Right Side: Live Layout Preview */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">
            Live Layout Preview
          </h3>
          <div className="border border-border rounded-[var(--radius)] overflow-hidden shadow-sm bg-secondary/10">
            <div className="h-10 bg-secondary/50 border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
            </div>

            {/* FIX 2: Exact Storefront Layout Replica */}
            <div className="p-4 md:p-6 w-full flex flex-col bg-background min-h-[350px] justify-center overflow-hidden">
              {banners.length > 0 ? (
                <div className="w-full">
                  <h4 className="text-foreground text-lg md:text-xl font-medium tracking-tight mb-4">
                    Our Sales Offers
                  </h4>
                  <div
                    className="flex overflow-x-auto snap-x gap-3 pb-2 hide-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {banners.map((b) => (
                      <div
                        key={b.id}
                        className="snap-start shrink-0 w-[140px] md:w-[160px] aspect-[3/4] relative rounded-xl overflow-hidden border border-border shadow-sm"
                      >
                        <Image
                          src={b.fileUrl}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[250px] border-2 border-dashed border-border rounded-xl bg-secondary/10 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <ImageIcon size={40} className="opacity-40" />
                  <span className="text-sm font-semibold uppercase tracking-widest text-center px-4">
                    Sales Banner Preview Area
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setIsDialogOpen(false);
          }
        }}
      >
        <DialogContent className="rounded-[var(--radius)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editId ? "Update Banner" : "Upload Banner"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Provide a portrait image (3:4 ratio) for the promotion and specify
              the target link URL.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* FIX 3: Taller upload preview area to accommodate portrait aspect ratio */}
            <div
              onClick={() => !isSaving && fileInputRef.current?.click()}
              className={`w-[220px] mx-auto h-[293px] border-2 border-dashed border-border rounded-xl bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors relative overflow-hidden shadow-sm ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              {activeFileUrl ? (
                <Image
                  src={activeFileUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <>
                  <UploadCloud
                    size={36}
                    className="text-muted-foreground mb-4"
                  />
                  <span className="text-sm font-medium text-foreground text-center">
                    Click to browse files
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 text-center px-4">
                    Portrait 3:4 ratio recommended
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Target Destination
              </label>
              <div className="flex items-center border border-border rounded-md h-12 bg-secondary/20 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all overflow-hidden">
                <span className="text-muted-foreground shrink-0 text-sm pl-4 font-medium bg-secondary/30 h-full flex items-center pr-2 border-r border-border/50">
                  bigboydeals.com/
                </span>
                <input
                  type="text"
                  value={activePath}
                  onChange={(e) => setActivePath(e.target.value)}
                  disabled={isSaving}
                  className="bg-transparent flex-1 h-full outline-none text-sm px-3 text-foreground placeholder:text-muted-foreground/50 font-medium"
                  placeholder="categories/summer-sale"
                />
              </div>
              <p className="text-[11px] text-muted-foreground pl-1">
                Leave empty to redirect to the home page.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsDialogOpen(false)}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-md m-0 font-semibold min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {editId ? "Saving..." : "Uploading..."}
                </>
              ) : editId ? (
                "Save Changes"
              ) : (
                "Upload Banner"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteAlert.open}
        onOpenChange={(open) =>
          !isSaving && setDeleteAlert({ ...deleteAlert, open })
        }
      >
        <AlertDialogContent className="rounded-[var(--radius)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Remove Promotion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              This action cannot be undone. The banner will be instantly removed
              from the store UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-6">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setDeleteAlert({ open: false })}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSaving}
              onClick={confirmDelete}
              className="rounded-md m-0 font-semibold min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
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
