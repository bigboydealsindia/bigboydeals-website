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
  LayoutGrid,
  GripHorizontal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { useCategoryStore, Category } from "@/store/useCategoryStore";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrders,
} from "@/app/actions/categories";
import { uploadAssetToStorage } from "@/app/actions/settings";

// --- DND Kit Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Sortable Card Component ---
function SortableCategoryCard({
  cat,
  fullDisplayPath,
  isReordering,
  onEdit,
  onDelete,
}: {
  cat: Category;
  fullDisplayPath: string;
  isReordering: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background border border-border rounded-md p-3 flex flex-col shadow-sm group transition-all relative ${
        isDragging
          ? "ring-2 ring-primary shadow-xl scale-105 opacity-90"
          : "hover:border-primary/20"
      }`}
    >
      <div className="relative w-full h-[130px] md:h-[160px] bg-secondary/20 rounded-md flex items-center justify-center mb-3 overflow-hidden border border-border/50">
        {cat.imageUrl ? (
          <Image
            src={cat.imageUrl}
            alt={cat.name}
            fill
            className="object-cover pointer-events-none"
          />
        ) : (
          <ImageIcon
            size={32}
            className="text-muted-foreground/50 pointer-events-none"
          />
        )}
        {cat.parentId && (
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-md border border-border shadow-sm">
            Sub-category
          </div>
        )}
      </div>

      <h4 className="font-semibold text-base px-1 truncate">{cat.name}</h4>
      <p className="text-xs text-muted-foreground px-1 truncate">
        {fullDisplayPath}
      </p>

      <Separator className="my-3" />

      {isReordering ? (
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center h-8 w-full rounded-md bg-secondary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripHorizontal size={16} className="mr-2" />
          <span className="text-sm font-medium">Drag to move</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(cat)}
            className="h-8 flex-1 rounded-md bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Pencil size={14} className="mr-2" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(cat.id)}
            className="h-8 flex-1 rounded-md bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive transition-colors"
          >
            <Trash2 size={14} className="mr-2" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Main Admin Page ---
export default function CategoriesAdminPage() {
  const { categories, isLoaded, setCategories } = useCategoryStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    id?: number;
  }>({ open: false });

  // Form States
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("null");
  const [activeFileUrl, setActiveFileUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag Sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadData = async () => {
    const data = await getAllCategories();
    setCategories(data);
  };

  useEffect(() => {
    if (!isLoaded) loadData();
  }, [isLoaded]);

  const primaryCategories = categories.filter((c) => c.parentId === null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over?.id);

      const newArray = arrayMove(categories, oldIndex, newIndex);

      // Update local state temporarily for smooth UI
      const updatedCategories = newArray.map((cat, index) => ({
        ...cat,
        sortOrder: index,
      }));
      setCategories(updatedCategories);
    }
  };

  const saveLayoutOrder = async () => {
    setIsSaving(true);
    const updates = categories.map((cat) => ({
      id: cat.id,
      sortOrder: cat.sortOrder,
    }));

    const res = await updateCategoryOrders(updates);
    if (res.success) {
      toast.success("Layout saved", {
        description: "Global layout order updated successfully.",
      });
      setIsReordering(false);
    } else {
      toast.error("Failed to save", { description: res.error });
    }
    setIsSaving(false);
  };

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

  const openDialog = (cat?: Category) => {
    setSelectedFile(null);
    if (cat) {
      setEditId(cat.id);
      setName(cat.name);
      setParentId(cat.parentId ? cat.parentId.toString() : "null");
      setActiveFileUrl(cat.imageUrl || "");
    } else {
      setEditId(null);
      setName("");
      setParentId("null");
      setActiveFileUrl("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name required", {
        description: "Please provide a category name.",
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

    const parentVal = parentId === "null" ? null : Number(parentId);

    if (editId) {
      await updateCategory(editId, name, finalUrl || null, parentVal);
      toast.success("Category updated", {
        description: "Changes have been saved successfully.",
      });
    } else {
      const res = await createCategory(name, finalUrl || null, parentVal);
      if (!res.success) {
        toast.error("Action Failed", { description: res.error });
        setIsSaving(false);
        return;
      }
      toast.success("Category added", {
        description: "New category is now live.",
      });
    }

    await loadData();
    setIsDialogOpen(false);
    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (deleteAlert.id) {
      setIsSaving(true);
      await deleteCategory(deleteAlert.id);
      toast.success("Category deleted", {
        description: "The category has been removed.",
      });
      await loadData();
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
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Organize your store structure and manage visual layouts.
          </p>
        </div>

        <div className="flex gap-3">
          {isReordering ? (
            <>
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => {
                  setIsReordering(false);
                  loadData();
                }}
                className="rounded-md h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={saveLayoutOrder}
                disabled={isSaving}
                className="rounded-md gap-2 h-10 px-5"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Save Layout"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsReordering(true)}
                className="rounded-md gap-2 h-10 px-4"
              >
                <LayoutGrid size={16} /> Manage Layout
              </Button>
              <Button
                onClick={() => openDialog()}
                className="rounded-md gap-2 h-10 px-5"
              >
                <Plus size={16} /> Add New Category
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid Layout (Sortable Context) */}
      {categories.length === 0 ? (
        <div className="text-center p-12 bg-secondary/20 border border-border rounded-md text-muted-foreground">
          No categories found. Create your first category to get started.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {categories.map((cat) => {
                // SMART LOGIC ADDED HERE FOR ADMIN DISPLAY PATH
                const parentCat = cat.parentId
                  ? categories.find((p) => p.id === cat.parentId)
                  : null;
                const fullDisplayPath = parentCat
                  ? `/category/${parentCat.slug}/${cat.slug}`
                  : `/category/${cat.slug}`;

                return (
                  <SortableCategoryCard
                    key={cat.id}
                    cat={cat}
                    fullDisplayPath={fullDisplayPath}
                    isReordering={isReordering}
                    onEdit={openDialog}
                    onDelete={(id) => setDeleteAlert({ open: true, id })}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !isSaving && setIsDialogOpen(open)}
      >
        <DialogContent className="rounded-md max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editId ? "Update Category" : "New Category"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Setup the structure. Sub-categories will appear under their
              primary parent in the dropdowns.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div
              onClick={() => !isSaving && fileInputRef.current?.click()}
              className={`w-full h-32 border-2 border-dashed border-border rounded-md bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors relative overflow-hidden ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            >
              {activeFileUrl ? (
                <Image
                  src={activeFileUrl}
                  alt="Preview"
                  fill
                  className="object-cover p-2 rounded-md"
                />
              ) : (
                <>
                  <UploadCloud
                    size={28}
                    className="text-muted-foreground mb-2"
                  />
                  <span className="text-sm font-medium">
                    Upload Category Image
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

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Category Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mens Wear"
                  disabled={isSaving}
                  className="rounded-md"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Hierarchy Level</label>
                <Select
                  value={parentId}
                  onValueChange={setParentId}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full rounded-md h-10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="null">
                      Primary Category (Main Navigation)
                    </SelectItem>
                    {primaryCategories
                      .filter((c) => c.id !== editId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          Sub-category under: {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
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
              className="rounded-md m-0"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Save Changes"
              )}
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
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              Are you sure? This will remove the category permanently. Any
              products linked to this category might lose their grouping.
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
