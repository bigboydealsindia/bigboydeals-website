import { getAllProducts, getDropdownCategories } from "@/app/actions/products";
import { getAllBrands } from "@/app/actions/brands";
import { AllProductsClient } from "@/components/product/AllProductsClient";

export const metadata = {
  title: "All Products | Big Boy Deals",
  description: "Browse our complete collection of exclusive products.",
};

export default async function AllProductsPage() {
  const [products, brands, categories] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getDropdownCategories(),
  ]);

  return (
    <AllProductsClient
      initialProducts={products}
      initialBrands={brands}
      categories={categories}
    />
  );
}
