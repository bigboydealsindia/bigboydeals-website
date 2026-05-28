"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Video,
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
import { useHeroStore } from "@/store/useHeroStore";
import {
  getStoreSettings,
  updateHeroSettings,
  uploadAssetToStorage,
} from "@/app/actions/settings";

export default function HeroSettingsPage() {
  const { banners, video, isLoaded, setHeroData } = useHeroStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    type: "banner" | "video";
    id?: string;
  }>({ open: false, type: "banner" });

  const [activeFileUrl, setActiveFileUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePath, setActivePath] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Fetch
  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoaded) {
        const settings = await getStoreSettings();
        setHeroData(settings.heroBanners || [], settings.heroVideo || null);
      }
    };
    loadSettings();
  }, [isLoaded, setHeroData]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Invalid file format", {
        description: "Please upload an image file.",
      });
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("Invalid file format", {
        description: "Please upload a video file.",
      });
      return;
    }

    setSelectedFile(file);
    setActiveFileUrl(URL.createObjectURL(file));
  };

  const openBannerDialog = (editItem?: {
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
    setIsBannerDialogOpen(true);
  };

  const openVideoDialog = () => {
    setSelectedFile(null);
    if (video) {
      setActiveFileUrl(video.fileUrl);
      setActivePath(video.path);
    } else {
      setActiveFileUrl("");
      setActivePath("");
    }
    setIsVideoDialogOpen(true);
  };

  const handleBannerSubmit = async () => {
    if (!activeFileUrl && !selectedFile) {
      toast.error("Image required", {
        description: "Please upload an image for the banner.",
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
        toast.error("Upload failed", { description: uploadRes.error });
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

    const saveRes = await updateHeroSettings(updatedBanners, video);
    if (saveRes.success) {
      setHeroData(updatedBanners, video);
      toast.success(editId ? "Banner updated" : "Banner added", {
        description: "Changes synced globally.",
      });
      setIsBannerDialogOpen(false);
    }
    setIsSaving(false);
  };

  const handleVideoSubmit = async () => {
    if (!activeFileUrl && !selectedFile) {
      toast.error("Video required", {
        description: "Please upload a video file.",
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
        toast.error("Upload failed", { description: uploadRes.error });
        setIsSaving(false);
        return;
      }
      finalUrl = uploadRes.url || "";
    }

    const updatedVideo = { fileUrl: finalUrl, path: activePath };
    const saveRes = await updateHeroSettings(banners, updatedVideo);

    if (saveRes.success) {
      setHeroData(banners, updatedVideo);
      toast.success("Video saved", {
        description: "Hero section video has been updated.",
      });
      setIsVideoDialogOpen(false);
    }
    setIsSaving(false);
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    let updatedBanners = [...banners];
    let updatedVideo = video;

    if (deleteAlert.type === "video") {
      updatedVideo = null;
    } else if (deleteAlert.type === "banner" && deleteAlert.id) {
      updatedBanners = updatedBanners.filter((b) => b.id !== deleteAlert.id);
    }

    const saveRes = await updateHeroSettings(updatedBanners, updatedVideo);
    if (saveRes.success) {
      setHeroData(updatedBanners, updatedVideo);
      toast.success(
        deleteAlert.type === "video" ? "Video removed" : "Banner removed",
        { description: "Content successfully deleted." },
      );
    }

    setDeleteAlert({ open: false, type: "banner" });
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
          <h2 className="text-3xl font-bold tracking-tight">Hero Section</h2>
          <p className="text-muted-foreground mt-1">
            Design your storefront greeting with banners and a feature video.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={openVideoDialog}
            variant="secondary"
            className="rounded-md gap-2 h-10 px-4"
            disabled={!!video || isSaving}
          >
            <Video size={16} /> Add Video
          </Button>
          <Button
            onClick={() => openBannerDialog()}
            className="rounded-md gap-2 h-10 px-4"
            disabled={isSaving}
          >
            <Plus size={16} /> Add Banner
          </Button>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-8 mt-8">
        {/* Left Side: Active Content Management */}
        <div className="xl:col-span-5 space-y-8">
          {/* Active Video Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">
              Active Feature Video
            </h3>
            <AnimatePresence mode="popLayout">
              {!video ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-[var(--radius)] border border-border text-center"
                >
                  No video added yet. Upload a vertical video to feature it on
                  the storefront.
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center p-3 bg-secondary/20 border border-border rounded-[var(--radius)] group"
                >
                  <div className="h-16 w-12 bg-black rounded-md overflow-hidden shrink-0 relative flex items-center justify-center">
                    <video
                      src={video.fileUrl}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <Video size={18} className="absolute text-white" />
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">Feature Reel</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      /{video.path || "home"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={openVideoDialog}
                      className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteAlert({ open: true, type: "video" })
                      }
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Banners Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">
              Active Banners
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {banners.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-[var(--radius)] border border-border text-center"
                  >
                    Your banner slider is currently empty.
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
                      <div className="h-12 w-20 bg-background rounded-md overflow-hidden shrink-0 relative border border-border">
                        <Image
                          src={banner.fileUrl}
                          alt="Banner thumbnail"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1 overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          /{banner.path || "home"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 px-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openBannerDialog(banner)}
                          className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteAlert({
                              open: true,
                              type: "banner",
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
        </div>

        {/* Right Side: Live Browser Preview */}
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

            <div className="p-4 md:p-6 w-full flex gap-3 h-[300px] md:h-[400px]">
              <div className="flex-[3] relative rounded-xl overflow-hidden border border-border bg-background flex items-center justify-center">
                {banners.length > 0 ? (
                  <Image
                    src={banners[0].fileUrl}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <ImageIcon size={32} className="opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Banner Slider
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-[1] relative rounded-xl overflow-hidden border border-border bg-background flex items-center justify-center max-w-[200px]">
                {video ? (
                  <video
                    src={video.fileUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Video size={32} className="opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider text-center px-2">
                      Video Reel
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isBannerDialogOpen || isVideoDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setIsBannerDialogOpen(false);
            setIsVideoDialogOpen(false);
          }
        }}
      >
        <DialogContent className="rounded-[var(--radius)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isBannerDialogOpen
                ? editId
                  ? "Update Banner"
                  : "Upload Banner"
                : "Upload Feature Video"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              {isBannerDialogOpen
                ? "Select a high-quality image and set where users should be taken when they click it."
                : "Upload a vertical video clip to capture attention. Provide a link for redirection."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            <div
              onClick={() => !isSaving && fileInputRef.current?.click()}
              className={`w-full h-40 border-2 border-dashed border-border rounded-lg bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors relative overflow-hidden ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              {activeFileUrl ? (
                isBannerDialogOpen ? (
                  <Image
                    src={activeFileUrl}
                    alt="Preview"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <video
                    src={activeFileUrl}
                    className="h-full w-full object-contain p-2"
                    muted
                    loop
                    autoPlay
                  />
                )
              ) : (
                <>
                  <UploadCloud
                    size={32}
                    className="text-muted-foreground mb-3"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Click to browse files
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {isBannerDialogOpen
                      ? "JPEG, PNG, WebP allowed"
                      : "MP4, WebM allowed"}
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={isBannerDialogOpen ? "image/*" : "video/*"}
              onChange={(e) =>
                handleFileChange(e, isBannerDialogOpen ? "image" : "video")
              }
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold">Redirection Link</label>
              <div className="flex items-center border border-border rounded-md px-3 h-11 bg-secondary/20 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                <span className="text-muted-foreground shrink-0 text-sm">
                  bigboydeals.com/
                </span>
                <input
                  type="text"
                  value={activePath}
                  onChange={(e) => setActivePath(e.target.value)}
                  disabled={isSaving}
                  className="bg-transparent flex-1 outline-none text-sm ml-1 text-foreground placeholder:text-muted-foreground/60"
                  placeholder="categories/tshirt"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                setIsBannerDialogOpen(false);
                setIsVideoDialogOpen(false);
              }}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              onClick={
                isBannerDialogOpen ? handleBannerSubmit : handleVideoSubmit
              }
              disabled={isSaving}
              className="rounded-md m-0"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Submit"
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
              Remove this content?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              This action is final. The {deleteAlert.type} will be immediately
              taken down from the live storefront.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-6">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setDeleteAlert({ open: false, type: "banner" })}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSaving}
              onClick={confirmDelete}
              className="rounded-md m-0"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
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
