"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  UploadCloud,
  Loader2,
  X,
  Palette,
  Ruler,
  BadgeCheck,
  Package,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";

import "react-quill-new/dist/quill.snow.css";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const QuillWrapper = function ({ ...props }: any) {
      return <RQ {...props} />;
    };
    QuillWrapper.displayName = "ReactQuillWrapper";
    return QuillWrapper;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[150px] w-full bg-secondary/20 animate-pulse rounded-md" />
    ),
  },
);

import { useProductStore, Product } from "@/store/useProductStore";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getDropdownCategories,
  toggleProductMostSelling,
} from "@/app/actions/products";
import { useBrandStore } from "@/store/useBrandStore";
import { getAllBrands } from "@/app/actions/brands";
import { uploadMultipleAssets } from "@/app/actions/settings";
import { ProductCard } from "@/components/admin/ProductCard";

export default function ProductsAdminPage() {
  const { products, isLoaded, setProducts } = useProductStore();
  const { brands, isLoaded: isBrandsLoaded, setBrands } = useBrandStore();

  const [allCategories, setAllCategories] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    id?: number;
  }>({ open: false });

  // Form States
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState<string>("");
  const [mainCategoryId, setMainCategoryId] = useState<string>("");
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [codAdvance, setCodAdvance] = useState("100"); // NAYA STATE ADD KIYA
  const [stock, setStock] = useState("0");
  const [supplierName, setSupplierName] = useState("");
  const [description, setDescription] = useState("");

  const [keyFeatures, setKeyFeatures] = useState([{ emoji: "✨", text: "" }]);
  const [colorVariants, setColorVariants] = useState([
    { hex: "#000000", name: "Default", path: "" },
  ]);
  const [sizeVariants, setSizeVariants] = useState([""]);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const [prodData, brandData, catData] = await Promise.all([
      getAllProducts(),
      !isBrandsLoaded ? getAllBrands() : Promise.resolve(brands),
      getDropdownCategories(),
    ]);
    setProducts(prodData);
    if (!isBrandsLoaded) setBrands(brandData);
    setAllCategories(catData || []);
  };

  useEffect(() => {
    if (!isLoaded) {
      const timer = setTimeout(() => {
        loadData();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setBrandId("");
    setMainCategoryId("");
    setSubCategoryId("");
    setSellingPrice("");
    setActualPrice("");
    setCodAdvance("100"); // Resetting new state
    setStock("0");
    setSupplierName("");
    setDescription("");
    setKeyFeatures([{ emoji: "✨", text: "" }]);
    setColorVariants([{ hex: "#000000", name: "Default", path: "" }]);
    setSizeVariants([""]);
    setMainImageFile(null);
    setMainImagePreview("");
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const openDialog = (product?: Product) => {
    resetForm();
    if (product) {
      setEditId(product.id);
      setName(product.name);
      setBrandId(product.brandId ? product.brandId.toString() : "");

      setMainCategoryId(
        (product as any).mainCategoryId
          ? (product as any).mainCategoryId.toString()
          : "",
      );
      setSubCategoryId(
        (product as any).subCategoryId
          ? (product as any).subCategoryId.toString()
          : "",
      );

      setSellingPrice(product.sellingPrice);
      setActualPrice(product.actualPrice);
      setCodAdvance(product.codAdvance ? product.codAdvance.toString() : "100"); // Loading new state
      setStock(product.stock ? product.stock.toString() : "0");
      setSupplierName(product.supplierName || "");
      setDescription(product.description || "");

      if (product.keyFeatures && product.keyFeatures.length > 0) {
        setKeyFeatures(
          product.keyFeatures.map((f) => {
            const split = f.split(" ");
            return { emoji: split[0], text: split.slice(1).join(" ") };
          }),
        );
      }

      if (product.colorVariants && product.colorVariants.length > 0)
        setColorVariants(product.colorVariants);
      if (product.sizeVariants && product.sizeVariants.length > 0)
        setSizeVariants(product.sizeVariants);

      setMainImagePreview(product.mainImage);
      setGalleryPreviews(product.galleryImages);
    }
    setIsDialogOpen(true);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const availableSlots = 3 - galleryFiles.length;
      const filesToAdd = files.slice(0, availableSlots);
      const newFiles = [...galleryFiles, ...filesToAdd];
      setGalleryFiles(newFiles);
      setGalleryPreviews(newFiles.map((f) => URL.createObjectURL(f)));
    }
  };

  const removeGalleryImage = (index: number) => {
    const newFiles = [...galleryFiles];
    newFiles.splice(index, 1);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !sellingPrice ||
      !actualPrice ||
      !brandId ||
      brandId === "null" ||
      !mainCategoryId ||
      !subCategoryId ||
      (!mainImageFile && !mainImagePreview)
    ) {
      toast.error("Required fields missing", {
        description:
          "Please provide product title, brand, categories, pricing, and main image.",
      });
      return;
    }

    setIsSaving(true);
    try {
      let finalMainImage = mainImagePreview;

      if (mainImageFile) {
        const mainFormData = new FormData();
        mainFormData.append("file", mainImageFile);
        const mainUploadRes = await uploadMultipleAssets([mainFormData]);
        if (!mainUploadRes.success) throw new Error("Main image upload failed");
        finalMainImage = mainUploadRes.urls[0];
      }

      let finalGalleryImages: string[] = galleryPreviews.filter(
        (p) => !p.startsWith("blob:"),
      );
      if (galleryFiles.length > 0) {
        const galleryFormDatas = galleryFiles.map((f) => {
          const fd = new FormData();
          fd.append("file", f);
          return fd;
        });
        const galleryUploadRes = await uploadMultipleAssets(galleryFormDatas);
        finalGalleryImages = [...finalGalleryImages, ...galleryUploadRes.urls];
      }

      const formattedFeatures = keyFeatures
        .map((f) => `${f.emoji} ${f.text}`)
        .filter((t) => t.length > 3);
      const formattedSizes = sizeVariants.filter((s) => s.trim() !== "");
      const formattedColors = colorVariants.filter((c) => c.name.trim() !== "");

      const productData = {
        name,
        brandId: Number(brandId),
        mainCategoryId: Number(mainCategoryId),
        subCategoryId: Number(subCategoryId),
        sellingPrice,
        actualPrice,
        codAdvance: Number(codAdvance) || 0, // NAYA FIELD ADDED
        stock: Number(stock) || 0,
        supplierName: supplierName.trim() || null,
        description,
        mainImage: finalMainImage,
        galleryImages: finalGalleryImages,
        keyFeatures: formattedFeatures,
        sizeVariants: formattedSizes,
        colorVariants: formattedColors,
      };

      let res;
      if (editId) {
        res = await updateProduct(editId, productData);
      } else {
        res = await createProduct(productData);
      }

      if (res.success) {
        toast.success(editId ? "Product Updated" : "Product Published", {
          description: editId
            ? "Changes saved successfully."
            : "Your new product has been successfully added.",
        });
        await loadData();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error("Submission failed", { description: error.message });
    }
    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (deleteAlert.id) {
      setIsSaving(true);
      try {
        await deleteProduct(deleteAlert.id);
        toast.success("Product deleted", {
          description: "The product has been removed permanently.",
        });
        await loadData();
      } catch (error) {
        toast.error("Deletion failed", {
          description: "Something went wrong while deleting.",
        });
      } finally {
        setDeleteAlert({ open: false });
        setIsSaving(false);
      }
    }
  };

  const handleToggleMostSelling = async (
    id: number,
    currentStatus: boolean,
  ) => {
    useProductStore.getState().toggleMostSelling(id);

    const res = await toggleProductMostSelling(id, currentStatus);

    if (res.success) {
      toast.success(
        res.newStatus ? "Marked as Most Selling!" : "Removed from Most Selling",
        {
          description: "Changes are live on the storefront.",
        },
      );
    } else {
      useProductStore.getState().toggleMostSelling(id);
      toast.error("Action Failed", {
        description: "Could not update the status.",
      });
    }
  };

  if (!isLoaded || !isBrandsLoaded) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const safeCategories = allCategories || [];
  const mainCategories = safeCategories.filter((c) => !c.parentId);
  const availableSubCategories = safeCategories.filter(
    (c) => c.parentId && c.parentId.toString() === mainCategoryId,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">
            Easily create and manage your product listings and inventory.
          </p>
        </div>
        <Button onClick={() => openDialog()} className="rounded-md h-10 px-6">
          <Plus size={16} className="mr-2" /> New Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center p-20 bg-secondary/10 border border-dashed rounded-md text-muted-foreground">
          No products found in your database.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              brandName={
                brands.find((b) => b.id === product.brandId)?.name ||
                "Unbranded"
              }
              onEdit={openDialog}
              onDelete={(id) => setDeleteAlert({ open: true, id })}
              onToggleMostSelling={handleToggleMostSelling}
            />
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !isSaving && setIsDialogOpen(open)}
      >
        <DialogContent
          className="w-[95vw] sm:max-w-[95vw] md:max-w-[1000px] lg:max-w-[1100px] h-[90vh] flex flex-col p-0 overflow-hidden rounded-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">
              {editId ? "Update Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              Define your product specifications and visual assets below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* LEFT COLUMN */}
              <div className="md:col-span-7 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                      Product Title *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Classic White Oversized Tee"
                      disabled={isSaving}
                      className="rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Brand */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Brand *</label>
                      <Select
                        value={brandId}
                        onValueChange={setBrandId}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="Choose Brand" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {brands.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              Create Brand First
                            </SelectItem>
                          ) : (
                            brands.map((b) => (
                              <SelectItem key={b.id} value={b.id.toString()}>
                                {b.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Main Category */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">
                        Main Category *
                      </label>
                      <Select
                        value={mainCategoryId}
                        onValueChange={(val) => {
                          setMainCategoryId(val);
                          setSubCategoryId("");
                        }}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {mainCategories.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              Please Create Categories
                            </SelectItem>
                          ) : (
                            mainCategories.map((mc) => (
                              <SelectItem key={mc.id} value={mc.id.toString()}>
                                {mc.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sub Category */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">
                        Sub Category *
                      </label>
                      <Select
                        value={subCategoryId}
                        onValueChange={setSubCategoryId}
                        disabled={!mainCategoryId || isSaving}
                      >
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="Select Sub" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {!mainCategoryId ? (
                            <SelectItem value="empty" disabled>
                              Select Main First
                            </SelectItem>
                          ) : availableSubCategories.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No Sub Categories Found
                            </SelectItem>
                          ) : (
                            availableSubCategories.map((sc) => (
                              <SelectItem key={sc.id} value={sc.id.toString()}>
                                {sc.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* FIX: Prices & COD Advance 3-column layout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                      Selling Price (₹) *
                    </label>
                    <Input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="999"
                      disabled={isSaving}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                      Actual Price (₹) *
                    </label>
                    <Input
                      type="number"
                      value={actualPrice}
                      onChange={(e) => setActualPrice(e.target.value)}
                      placeholder="1999"
                      disabled={isSaving}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-primary">
                      COD Advance (₹) *
                    </label>
                    <Input
                      type="number"
                      value={codAdvance}
                      onChange={(e) => setCodAdvance(e.target.value)}
                      placeholder="100"
                      disabled={isSaving}
                      className="rounded-md border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Ruler size={16} /> Sizing Variations
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSizeVariants([...sizeVariants, ""])}
                      className="h-7 text-xs rounded-md"
                    >
                      Add Size
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeVariants.map((sz, index) => (
                      <div key={index} className="flex items-center group">
                        <Input
                          value={sz}
                          onChange={(e) => {
                            const newArr = [...sizeVariants];
                            newArr[index] = e.target.value;
                            setSizeVariants(newArr);
                          }}
                          placeholder="e.g. XL"
                          className="w-20 rounded-md text-center"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newArr = [...sizeVariants];
                            newArr.splice(index, 1);
                            setSizeVariants(newArr);
                          }}
                          disabled={sizeVariants.length === 1}
                          className="h-10 w-8 text-muted-foreground hover:text-destructive rounded-md"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Package size={16} /> Available Stock
                    </label>
                  </div>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Enter total stock quantity"
                    disabled={isSaving}
                    min="0"
                    className="w-full sm:w-[200px] rounded-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    Items sold will be automatically deducted from this
                    inventory count.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <label className="text-sm font-semibold">
                    Product Visuals
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div
                        onClick={() =>
                          !isSaving && mainImageRef.current?.click()
                        }
                        className="aspect-[4/5] border-2 border-dashed rounded-md bg-secondary/10 flex items-center justify-center cursor-pointer relative overflow-hidden"
                      >
                        {mainImagePreview ? (
                          <Image
                            src={mainImagePreview}
                            alt="Main"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <UploadCloud className="text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-[10px] block text-center font-bold text-muted-foreground">
                        PRIMARY
                      </span>
                      <input
                        type="file"
                        ref={mainImageRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </div>
                    {galleryPreviews.map((p, i) => (
                      <div
                        key={i}
                        className="relative aspect-[4/5] rounded-md overflow-hidden group border"
                      >
                        <Image
                          src={p}
                          alt="Gallery"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 bg-destructive p-1 rounded-sm text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {galleryPreviews.length < 3 && (
                      <div
                        onClick={() => !isSaving && galleryRef.current?.click()}
                        className="aspect-[4/5] border-2 border-dashed rounded-md bg-secondary/5 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="text-muted-foreground" />
                        <input
                          type="file"
                          ref={galleryRef}
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="md:col-span-5 space-y-8 bg-secondary/5 p-4 rounded-md border border-border/50">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">
                    Supplier Name{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. ABC Textiles / XYZ Electronics"
                    disabled={isSaving}
                    className="rounded-md bg-background border-border"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <BadgeCheck size={16} /> Key Highlights
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setKeyFeatures([
                          ...keyFeatures,
                          { emoji: "✅", text: "" },
                        ])
                      }
                      className="h-7 text-xs"
                    >
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {keyFeatures.map((kf, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={kf.emoji}
                          onChange={(e) => {
                            const newArr = [...keyFeatures];
                            newArr[i].emoji = e.target.value;
                            setKeyFeatures(newArr);
                          }}
                          className="w-12 text-center p-0 rounded-md text-lg"
                          placeholder="✨"
                        />
                        <Input
                          value={kf.text}
                          onChange={(e) => {
                            const newArr = [...keyFeatures];
                            newArr[i].text = e.target.value;
                            setKeyFeatures(newArr);
                          }}
                          placeholder="e.g. Breathable Fabric"
                          className="flex-1 rounded-md"
                        />
                        {i > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newArr = [...keyFeatures];
                              newArr.splice(i, 1);
                              setKeyFeatures(newArr);
                            }}
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Palette size={16} /> Color Variants
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setColorVariants([
                          ...colorVariants,
                          { hex: "#ffffff", name: "", path: "" },
                        ])
                      }
                      className="h-7 text-xs"
                    >
                      Add Color
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {colorVariants.map((col, i) => (
                      <div
                        key={i}
                        className="p-3 bg-background border rounded-md space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={col.hex}
                            onChange={(e) => {
                              const newArr = [...colorVariants];
                              newArr[i].hex = e.target.value;
                              setColorVariants(newArr);
                            }}
                            className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                          />
                          <Input
                            value={col.name}
                            onChange={(e) => {
                              const newArr = [...colorVariants];
                              newArr[i].name = e.target.value;
                              setColorVariants(newArr);
                            }}
                            placeholder="Color Name"
                            className="flex-1 h-8 rounded-md"
                          />
                          {i > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const newArr = [...colorVariants];
                                newArr.splice(i, 1);
                                setColorVariants(newArr);
                              }}
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                        {i > 0 && (
                          <Input
                            value={col.path}
                            onChange={(e) => {
                              const newArr = [...colorVariants];
                              newArr[i].path = e.target.value;
                              setColorVariants(newArr);
                            }}
                            placeholder="Redirect Link (URL)"
                            className="h-8 rounded-md text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col h-[300px]">
                  <label className="text-sm font-semibold">
                    Product Description
                  </label>
                  <div className="flex-1 bg-background rounded-md border border-border overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-container]:border-none [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={setDescription}
                      modules={quillModules}
                      placeholder="Provide in-depth information about the product..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-background flex flex-row justify-end gap-3 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsDialogOpen(false)}
              className="rounded-md"
            >
              Cancel Process
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-md min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />{" "}
                  {editId ? "Saving..." : "Uploading..."}
                </>
              ) : editId ? (
                "Save Changes"
              ) : (
                "Upload Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteAlert.open}
        onOpenChange={(open) => !isSaving && setDeleteAlert({ open })}
      >
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Permanent Deletion?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will erase the product and all linked data from your catalog.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAlert({ open: false })}
              className="rounded-md"
            >
              Keep Product
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="rounded-md"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}{" "}
              Yes, Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
