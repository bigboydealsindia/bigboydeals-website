import { WishlistClient } from "@/components/wishlist/WishlistClient";

export const metadata = {
  title: "My Wishlist | Big Boy Deals",
  description: "View and manage your saved products.",
};

export default function WishlistPage() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 min-h-[60vh]">
      <WishlistClient />
    </div>
  );
}
