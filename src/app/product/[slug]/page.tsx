import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { products, brands, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { Separator } from "@/components/ui/separator";
import { ProductReviews } from "@/components/product/ProductReviews";
import { SimilarProducts } from "@/components/product/SimilarProducts";
import { getUserProfile } from "@/app/actions/auth";
import { getProductReviews } from "@/app/actions/reviews";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const productData = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!productData) {
    notFound();
  }

  let associatedBrand = null;
  if (productData.brandId) {
    associatedBrand = await db.query.brands.findFirst({
      where: eq(brands.id, productData.brandId),
    });
  }

  const brandName = associatedBrand ? associatedBrand.name : "Exclusive";

  let mainCategoryName = "Category";
  if (productData.mainCategoryId) {
    const mainCat = await db.query.categories.findFirst({
      where: eq(categories.id, productData.mainCategoryId),
    });
    if (mainCat) mainCategoryName = mainCat.name;
  }

  let subCategoryName = "Sub Category";
  if (productData.subCategoryId) {
    const subCat = await db.query.categories.findFirst({
      where: eq(categories.id, productData.subCategoryId),
    });
    if (subCat) subCategoryName = subCat.name;
  }

  const discountAmount = 0;

  const currentUser = await getUserProfile();

  const fetchedReviews = await getProductReviews(productData.id);
  const activeReviews = fetchedReviews.filter((r) => r.showOnWebsite);
  const totalReviews = activeReviews.length;
  const averageRating =
    totalReviews > 0
      ? activeReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

  const formattedProduct = {
    id: productData.id,
    name: productData.name ?? "Unnamed",
    sellingPrice: productData.sellingPrice,
    actualPrice: productData.actualPrice,
    codAdvance: productData.codAdvance ?? 100, // NAYA FIELD DATA
    keyFeatures: (productData.keyFeatures as string[]) || [],
    colorVariants:
      (productData.colorVariants as {
        hex: string;
        name: string;
        path: string;
      }[]) || [],
    sizeVariants: (productData.sizeVariants as string[]) || [],
    description: productData.description,
    stock: productData.stock,
    totalReviews,
    averageRating,
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6">
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-60" />
        <span className="opacity-80">{mainCategoryName}</span>
        <ChevronRight size={12} className="opacity-60" />
        <span className="opacity-80">{subCategoryName}</span>
        <ChevronRight size={12} className="opacity-60" />
        <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">
          {productData.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="w-full">
          <ProductImageGallery
            mainImage={productData.mainImage}
            galleryImages={(productData.galleryImages as string[]) || []}
            productName={productData.name ?? "Product"}
            discount={discountAmount}
            isMostSelling={productData.isMostSelling}
          />
        </div>

        <div className="w-full">
          <ProductDetails product={formattedProduct} brandName={brandName} />
        </div>
      </div>

      <Separator className="my-10" />
      <ProductReviews
        productId={productData.id}
        currentUser={currentUser ?? null}
      />

      <Separator className="my-10" />
      <SimilarProducts
        currentProductId={productData.id}
        categoryId={productData.mainCategoryId}
      />
    </div>
  );
}
