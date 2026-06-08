import { create } from "zustand";

export interface Product {
  id: number;
  name: string;
  slug: string;
  brandId: number | null;
  sellingPrice: string;
  actualPrice: string;
  stock: number;
  codAdvance: number;
  supplierName?: string | null; // NAYA FIELD
  keyFeatures: string[];
  colorVariants: { hex: string; name: string; path: string }[];
  sizeVariants: string[];
  description: string | null;
  mainImage: string;
  galleryImages: string[];
  isMostSelling: boolean;
  createdAt: Date;
}

interface ProductState {
  products: Product[];
  isLoaded: boolean;
  setProducts: (products: Product[]) => void;
  toggleMostSelling: (id: number) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoaded: false,
  setProducts: (products) => set({ products, isLoaded: true }),
  toggleMostSelling: (id) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, isMostSelling: !p.isMostSelling } : p,
      ),
    })),
}));
