import { db } from "@/db";
import { products, brands } from "@/db/schema";
import { eq, ne, and, desc } from "drizzle-orm";
import { SimilarProductCard } from "./SimilarProductCard";

interface SimilarProductsProps {
  currentProductId: number;
  categoryId: number | null;
}

export async function SimilarProducts({
  currentProductId,
  categoryId,
}: SimilarProductsProps) {
  if (!categoryId) return null;

  const fetchedData = await db
    .select({
      product: products,
      brandName: brands.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(
      and(
        eq(products.mainCategoryId, categoryId),
        ne(products.id, currentProductId),
      ),
    )
    .orderBy(desc(products.createdAt))
    .limit(6);

  if (fetchedData.length === 0) return null;

  return (
    <div className="py-6">
      <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-6">
        Similar Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {fetchedData.map(({ product, brandName }) => {
          const sellingPriceNum = Number(product.sellingPrice);
          const actualPriceNum = Number(product.actualPrice);
          const discount =
            actualPriceNum > 0 && sellingPriceNum < actualPriceNum
              ? Math.round(
                  ((actualPriceNum - sellingPriceNum) / actualPriceNum) * 100,
                )
              : 0;

          return (
            <SimilarProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name ?? "Unnamed",
                mainImage: product.mainImage,
                sellingPrice: product.sellingPrice,
                actualPrice: product.actualPrice,
                codAdvance: product.codAdvance ?? 100, // NAYA FIELD ADDED
                isMostSelling: product.isMostSelling,
              }}
              brandName={brandName || "Exclusive"}
              discount={discount}
            />
          );
        })}
      </div>
    </div>
  );
}
