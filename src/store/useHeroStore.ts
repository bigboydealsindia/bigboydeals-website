import { create } from "zustand";

interface HeroBanner {
  id: string;
  fileUrl: string;
  path: string;
}

interface HeroVideo {
  fileUrl: string;
  path: string;
}

interface HeroState {
  banners: HeroBanner[];
  video: HeroVideo | null;
  isLoaded: boolean;
  setHeroData: (banners: HeroBanner[], video: HeroVideo | null) => void;
}

export const useHeroStore = create<HeroState>((set) => ({
  banners: [],
  video: null,
  isLoaded: false,
  setHeroData: (banners, video) => set({ banners, video, isLoaded: true }),
}));
