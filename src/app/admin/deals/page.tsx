import { DealsClient } from "@/components/admin/DealsClient";
import { getAllProducts } from "@/app/actions/products";
import { getAdminDealConfig } from "@/app/actions/deals";

export const revalidate = 0; // Disable static generation

export const metadata = {
  title: "Manage Deals | Admin Panel",
};

export default async function AdminDealsPage() {
  const allProducts = await getAllProducts();
  const currentDeal = await getAdminDealConfig();

  return <DealsClient allProducts={allProducts} currentDeal={currentDeal} />;
}
