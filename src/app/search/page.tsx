import { searchProducts } from "@/app/actions/search";
import { SearchClient } from "@/components/product/SearchClient";
import { getAllBrands } from "@/app/actions/brands";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  // 1. Database se query match fetch karo
  const rawResults = await searchProducts(query);

  // Clean structure map karke sirf products array bhej rahe hain taaki SearchClient easily process kare
  const products = rawResults.map((r) => r.product);

  // 2. Fetch all brands mapping ke liye
  const brands = await getAllBrands();

  return <SearchClient query={query} products={products} brands={brands} />;
}
