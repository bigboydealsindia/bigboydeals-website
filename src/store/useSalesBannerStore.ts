import { create } from "zustand";

export interface SalesBanner {
  id: string;
  fileUrl: string;
  path: string;
}

interface SalesBannerState {
  banners: SalesBanner[];
  isLoaded: boolean;
  setBanners: (banners: SalesBanner[]) => void;
}

export const useSalesBannerStore = create<SalesBannerState>((set) => ({
  banners: [],
  isLoaded: false,
  setBanners: (banners) => set({ banners, isLoaded: true }),
}));
