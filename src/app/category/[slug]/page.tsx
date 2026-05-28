import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, products, brands } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAllBrands } from "@/app/actions/brands";
import { CategoryProductsClient } from "@/components/product/CategoryProductsClient";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  // 1. Fetch current primary category
  const currentCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  // Security check: If category doesn't exist or it is a sub-category (has parentId), return 404
  if (!currentCategory || currentCategory.parentId) {
    notFound();
  }

  // 2. Fetch all sub-categories belonging to this primary category
  const subCategories = await db.query.categories.findMany({
    where: eq(categories.parentId, currentCategory.id),
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });

  // 3. Fetch all products matching this main category
  const productsInCollection = await db.query.products.findMany({
    where: eq(products.mainCategoryId, currentCategory.id),
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  // 4. Fetch brands for card labels
  const allBrands = await getAllBrands();

  return (
    <CategoryProductsClient
      currentCategory={currentCategory}
      subCategories={subCategories}
      products={productsInCollection}
      brands={allBrands}
    />
  );
}
