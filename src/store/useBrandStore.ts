import { create } from "zustand";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: Date;
}

interface BrandState {
  brands: Brand[];
  isLoaded: boolean;
  setBrands: (brands: Brand[]) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [],
  isLoaded: false,
  setBrands: (brands) => set({ brands, isLoaded: true }),
}));
