import { notFound } from "next/navigation";
import { getAllProducts, getDropdownCategories } from "@/app/actions/products";
import { getAllBrands } from "@/app/actions/brands";
import { AllProductsClient } from "@/components/product/AllProductsClient";

export const revalidate = 3600; // ISR: Revalidate every hour

export default async function CategoryCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const mainSlug = slug[0]; // Example: "men"
  const subSlug = slug[1]; // Example: "tshirt" (optional)

  const [products, brands, categories] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getDropdownCategories(),
  ]);

  // Find Main Category
  const mainCat = categories.find((c) => c.slug === mainSlug && !c.parentId);
  if (!mainCat) notFound();

  // Find Sub Category (If requested in URL)
  let subCat = null;
  if (subSlug) {
    subCat = categories.find(
      (c) => c.slug === subSlug && c.parentId === mainCat.id,
    );
    if (!subCat) notFound();
  }

  return (
    <AllProductsClient
      initialProducts={products}
      initialBrands={brands}
      categories={categories}
      preSelectedMainCat={mainCat.id}
      preSelectedSubCat={subCat ? subCat.id : null}
    />
  );
}
