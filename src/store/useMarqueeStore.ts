import { create } from "zustand";

interface MarqueeState {
  items: string[];
  isActive: boolean;
  isLoaded: boolean;
  setMarquee: (items: string[], isActive: boolean) => void;
}

export const useMarqueeStore = create<MarqueeState>((set) => ({
  items: [],
  isActive: false,
  isLoaded: false, // Taaki UI tab tak wait kare jab tak DB se data na aa jaye
  setMarquee: (items, isActive) => set({ items, isActive, isLoaded: true }),
}));
