import { getAllCoupons } from "@/app/actions/coupons";
import { getAllProducts } from "@/app/actions/products";
import { CouponsClient } from "@/components/admin/CouponsClient";

export const revalidate = 0; // Disable static generation

export const metadata = {
  title: "Manage Coupons | Admin Panel",
};

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();
  const products = await getAllProducts();

  return (
    <div className="w-full">
      <CouponsClient initialCoupons={coupons} products={products} />
    </div>
  );
}
