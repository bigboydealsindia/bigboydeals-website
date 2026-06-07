"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  createStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
} from "@/app/actions/staff";
import {
  UsersRound,
  ShieldCheck,
  Plus,
  Loader2,
  Mail,
  Lock,
  User,
  Pen,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const availablePages = [
  { label: "Dashboard", value: "/admin" },
  { label: "Categories", value: "/admin/categories" },
  { label: "Brands", value: "/admin/our-brands" },
  { label: "Products", value: "/admin/products" },
  { label: "Deals", value: "/admin/deals" },
  { label: "Orders", value: "/admin/orders" },
  { label: "Reviews", value: "/admin/reviews" },
  { label: "Newsletter", value: "/admin/newsletter" },
  { label: "Messages", value: "/admin/messages" },
  { label: "Coupons", value: "/admin/coupons" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */

export function StaffManagementClient({
  initialStaff,
}: {
  initialStaff: any[];
}) {
  const router = useRouter();

  // Modals States
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form States
  const [selectedPages, setSelectedPages] = useState<string[]>(["/admin"]);

  const togglePageSelection = (pageValue: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageValue)
        ? prev.filter((p) => p !== pageValue)
        : [...prev, pageValue],
    );
  };

  // 1. ADD STAFF HANDLER
  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPages.length === 0)
      return toast.error("Select at least one page.");

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createStaffAccount(formData, selectedPages);
      if (result.success) {
        toast.success("Staff account created successfully!");
        setIsAdding(false);
        setSelectedPages(["/admin"]);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create account.");
      }
    } catch {
      toast.error("Internal Server Error.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. EDIT STAFF HANDLER
  const handleEditStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPages.length === 0)
      return toast.error("Select at least one page.");

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const newPassword = formData.get("password") as string;

    try {
      const result = await updateStaffAccount(
        isEditing.id,
        fullName,
        selectedPages,
        newPassword,
      );
      if (result.success) {
        toast.success("Staff updated successfully!");
        setIsEditing(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update.");
      }
    } catch {
      toast.error("Internal Server Error.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. DELETE STAFF HANDLER
  const handleDeleteStaff = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteStaffAccount(deleteId);
      if (result.success) {
        toast.success("Staff account deleted permanently!");
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete.");
      }
    } catch {
      toast.error("Internal Server Error.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (staff: any) => {
    setIsEditing(staff);
    setSelectedPages(staff.accessPages || ["/admin"]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <UsersRound size={20} className="text-primary" /> Current Staff
        </h2>
        <Button
          onClick={() => {
            setSelectedPages(["/admin"]);
            setIsAdding(true);
          }}
          className="gap-2 rounded-md"
        >
          <Plus size={16} /> Add New Staff
        </Button>
      </div>

      {/* STAFF LIST TABLE */}
      <div className="bg-background border border-border rounded-md overflow-hidden shadow-sm">
        {initialStaff.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
            <UsersRound size={40} className="mb-3 opacity-20" />
            <p>No staff members found.</p>
            <p className="text-sm mt-1">
              Click "Add New Staff" to create an account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 border-b border-border text-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Password</th>
                  <th className="px-6 py-4 font-semibold">Allowed Access</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground capitalize">
                      {staff.fullName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {staff.email}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="font-mono text-xs tracking-widest bg-secondary/50 px-2 py-1 rounded">
                        ••••••••
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {staff.accessPages?.map((path: string) => {
                          const label =
                            availablePages.find((p) => p.value === path)
                              ?.label || path;
                          return (
                            <span
                              key={path}
                              className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/50 hover:bg-primary/10 rounded-md"
                          title="Edit Staff"
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(staff.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/50 hover:bg-destructive/10 rounded-md"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. ADD NEW STAFF DIALOG */}
      {/* ======================================================== */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-2xl rounded-md bg-background border-border p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/10">
            <DialogTitle className="text-xl font-bold">
              Create Staff Account
            </DialogTitle>
            <DialogDescription>
              Add a new staff member and assign their page access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStaff} className="p-6 space-y-6">
            {/* FIX: Changed grid layout to prevent inputs from squishing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full Name</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    name="fullName"
                    placeholder="John Doe"
                    required
                    className="pl-10 rounded-md border-border h-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email Address</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    type="email"
                    name="email"
                    placeholder="staff@bigboydeals.com"
                    required
                    className="pl-10 rounded-md border-border h-10"
                  />
                </div>
              </div>
              {/* Password takes full width on small screens to avoid wrapping */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    name="password"
                    placeholder="e.g., Staff@123"
                    required
                    minLength={6}
                    className="pl-10 rounded-md border-border h-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" /> Assign Page
                Access
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availablePages.map((page) => (
                  <label
                    key={page.value}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                      selectedPages.includes(page.value)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(page.value)}
                      onChange={() => togglePageSelection(page.value)}
                      className="accent-primary w-4 h-4"
                      disabled={page.value === "/admin"}
                    />
                    <span className="text-sm font-medium select-none">
                      {page.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="rounded-md h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-md h-10 min-w-[160px]"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                {isLoading ? "Creating..." : "Create Staff Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 2. EDIT STAFF DIALOG */}
      {/* ======================================================== */}
      <Dialog
        open={!!isEditing}
        onOpenChange={(open) => !open && setIsEditing(null)}
      >
        <DialogContent className="max-w-2xl rounded-md bg-background border-border p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/10">
            <DialogTitle className="text-xl font-bold">
              Edit Staff Access
            </DialogTitle>
            <DialogDescription>
              Update permissions or reset password for {isEditing?.fullName}.
            </DialogDescription>
          </DialogHeader>

          {isEditing && (
            <form onSubmit={handleEditStaff} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Full Name</label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-3 text-muted-foreground"
                    />
                    <Input
                      name="fullName"
                      defaultValue={isEditing.fullName}
                      required
                      className="pl-10 rounded-md border-border h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    New Password{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-3 text-muted-foreground"
                    />
                    <Input
                      type="text"
                      name="password"
                      placeholder="Leave blank to keep current"
                      minLength={6}
                      className="pl-10 rounded-md border-border h-10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" /> Update Page
                  Access
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availablePages.map((page) => (
                    <label
                      key={`edit-${page.value}`}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                        selectedPages.includes(page.value)
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 bg-background"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.value)}
                        onChange={() => togglePageSelection(page.value)}
                        className="accent-primary w-4 h-4"
                        disabled={page.value === "/admin"}
                      />
                      <span className="text-sm font-medium select-none">
                        {page.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(null)}
                  className="rounded-md h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-md h-10 min-w-[140px]"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : null}
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* 3. DELETE CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-md border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Delete Staff Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              staff member's account and remove their access to the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStaff}
              disabled={isDeleting}
              className="rounded-md m-0"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              {isDeleting ? "Deleting..." : "Yes, Delete Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
