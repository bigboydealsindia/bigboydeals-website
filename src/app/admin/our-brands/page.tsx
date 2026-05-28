"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Pencil,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
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

// Stores & Actions
import { useBrandStore, Brand } from "@/store/useBrandStore";
import { useProductStore } from "@/store/useProductStore";
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/app/actions/brands";
import { getAllProducts } from "@/app/actions/products";
import { uploadAssetToStorage } from "@/app/actions/settings";

export default function BrandsAdminPage() {
  const { brands, isLoaded: isBrandsLoaded, setBrands } = useBrandStore();
  const {
    products,
    isLoaded: isProductsLoaded,
    setProducts,
  } = useProductStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    id?: number;
  }>({ open: false });

  // Form States
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [activeFileUrl, setActiveFileUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const [brandsData, productsData] = await Promise.all([
      getAllBrands(),
      getAllProducts(),
    ]);
    setBrands(brandsData);
    setProducts(productsData);
  };

  useEffect(() => {
    if (!isBrandsLoaded || !isProductsLoaded) loadData();
  }, [isBrandsLoaded, isProductsLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format", {
        description: "You can only upload image files.",
      });
      return;
    }

    setSelectedFile(file);
    setActiveFileUrl(URL.createObjectURL(file));
  };

  const openDialog = (brand?: Brand) => {
    setSelectedFile(null);
    if (brand) {
      setEditId(brand.id);
      setName(brand.name);
      setActiveFileUrl(brand.imageUrl || "");
    } else {
      setEditId(null);
      setName("");
      setActiveFileUrl("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

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

    if (editId) {
      await updateBrand(editId, name, finalUrl || null);
      toast.success("Brand updated", {
        description: "Brand details saved successfully.",
      });
    } else {
      const res = await createBrand(name, finalUrl || null);
      if (!res.success) {
        toast.error("Action Failed", { description: res.error });
        setIsSaving(false);
        return;
      }
      toast.success("Brand added", {
        description: "New brand is now available.",
      });
    }

    await loadData();
    setIsDialogOpen(false);
    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (deleteAlert.id) {
      setIsSaving(true);
      await deleteBrand(deleteAlert.id);
      toast.success("Brand removed", {
        description: "The brand has been deleted permanently.",
      });
      await loadData();
    }
    setDeleteAlert({ open: false });
    setIsSaving(false);
  };

  if (!isBrandsLoaded || !isProductsLoaded) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Smart Button States
  const isFormValid = name.trim().length > 0;
  const buttonText = editId
    ? isSaving
      ? "Saving..."
      : "Save Changes"
    : isSaving
      ? "Uploading..."
      : "Save Upload";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Our Brands</h2>
          <p className="text-muted-foreground mt-1">
            Manage the brands associated with your store products.
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="rounded-md gap-2 h-10 px-5"
        >
          <Plus size={16} /> Add New Brand
        </Button>
      </div>

      {/* Grid Layout */}
      {brands.length === 0 ? (
        <div className="text-center p-12 bg-secondary/20 border border-border rounded-md text-muted-foreground">
          You haven't added any brands yet. Click the button above to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          <AnimatePresence>
            {brands.map((brand) => {
              // Get the dynamic count of products for this specific brand
              const linkedProductsCount = products.filter(
                (p) => p.brandId === brand.id,
              ).length;

              return (
                <motion.div
                  layout
                  key={brand.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-background border border-border rounded-md p-3 flex flex-col shadow-sm group hover:border-primary/20 transition-colors"
                >
                  <div className="relative w-full h-[140px] bg-secondary/10 rounded-md p-3 flex items-center justify-center mb-3 overflow-hidden border border-border/50">
                    <div className="relative w-full h-full rounded-md overflow-hidden flex items-center justify-center bg-white">
                      {brand.imageUrl ? (
                        <Image
                          src={brand.imageUrl}
                          alt={brand.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <ImageIcon
                          size={32}
                          className="text-muted-foreground/30"
                        />
                      )}
                    </div>
                  </div>

                  <h4 className="font-semibold text-base px-1 truncate">
                    {brand.name}
                  </h4>

                  <p className="text-xs text-muted-foreground px-1 mt-0.5">
                    {linkedProductsCount} Linked{" "}
                    {linkedProductsCount === 1 ? "Product" : "Products"}
                  </p>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(brand)}
                      className="h-8 flex-1 rounded-md bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil size={14} className="mr-2" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeleteAlert({ open: true, id: brand.id })
                      }
                      className="h-8 flex-1 rounded-md bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} className="mr-2" /> Delete
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !isSaving && setIsDialogOpen(open)}
      >
        <DialogContent className="rounded-md max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editId ? "Edit Brand Details" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Upload the official logo and specify the brand name.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            <div
              onClick={() => !isSaving && fileInputRef.current?.click()}
              className={`w-full h-32 border-2 border-dashed border-border rounded-md bg-secondary/20 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/40 transition-colors relative overflow-hidden ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              {activeFileUrl ? (
                <Image
                  src={activeFileUrl}
                  alt="Preview"
                  fill
                  className="object-contain p-3"
                />
              ) : (
                <>
                  <UploadCloud
                    size={28}
                    className="text-muted-foreground mb-2"
                  />
                  <span className="text-sm font-medium">
                    Upload Brand Image
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

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Brand Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nike, Adidas, Puma"
                disabled={isSaving}
                className="rounded-md"
              />
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
              disabled={!isFormValid || isSaving}
              className="rounded-md m-0 w-32"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              {buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={deleteAlert.open}
        onOpenChange={(open) => !isSaving && setDeleteAlert({ open })}
      >
        <AlertDialogContent className="rounded-md max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete this brand?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              Are you sure you want to remove this brand from your store? This
              action cannot be undone.
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
              className="rounded-md m-0"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Yes, Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
