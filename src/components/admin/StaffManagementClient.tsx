"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createStaffAccount } from "@/app/actions/staff";
import { toast } from "sonner";
import {
  UsersRound,
  ShieldCheck,
  Plus,
  Loader2,
  Mail,
  Lock,
  User,
  X,
} from "lucide-react";

// Jo pages staff access kar sakta hai uski list
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
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>(["/admin"]); // Default Dashboard access

  const togglePageSelection = (pageValue: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageValue)
        ? prev.filter((p) => p !== pageValue)
        : [...prev, pageValue],
    );
  };

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page for access.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await createStaffAccount(formData, selectedPages);

    if (result.success) {
      toast.success("Staff account created successfully!");
      setIsAdding(false);
      setSelectedPages(["/admin"]); // reset form state
      router.refresh(); // Refresh list
    } else {
      toast.error(result.error || "Failed to create staff account.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <UsersRound size={20} className="text-primary" /> Current Staff
        </h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus size={16} /> Add New Staff
          </Button>
        )}
      </div>

      {/* ADD STAFF FORM (Toggleable) */}
      {isAdding && (
        <div className="bg-secondary/10 border border-border p-6 rounded-[var(--radius)] shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">
              Create Staff Account
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddStaff} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    name="fullName"
                    placeholder="John Doe"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
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
                    className="pl-10"
                  />
                </div>
              </div>
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
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
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Access Permissions Setup */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" /> Assign Page
                Access
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                      disabled={page.value === "/admin"} // Dashboard access is mandatory
                    />
                    <span className="text-sm font-medium select-none">
                      {page.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * Selected pages will be visible in their sidebar. Unselected
                pages will show "Access Denied".
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[150px]"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STAFF LIST TABLE */}
      <div className="bg-background border border-border rounded-[var(--radius)] overflow-hidden">
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
                  <th className="px-6 py-4 font-semibold">Allowed Access</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Joined On
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {staff.accessPages?.map((path: string) => {
                          const label =
                            availablePages.find((p) => p.value === path)
                              ?.label || path;
                          return (
                            <span
                              key={path}
                              className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
