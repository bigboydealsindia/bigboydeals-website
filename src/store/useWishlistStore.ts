import { create } from "zustand";

interface WishlistState {
  wishlistIds: number[];
  isLoaded: boolean;
  setWishlist: (ids: number[]) => void;
  toggleItem: (id: number) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlistIds: [],
  isLoaded: false,
  setWishlist: (ids) => set({ wishlistIds: ids, isLoaded: true }),
  toggleItem: (id) =>
    set((state) => ({
      wishlistIds: state.wishlistIds.includes(id)
        ? state.wishlistIds.filter((itemId) => itemId !== id)
        : [...state.wishlistIds, id],
    })),
}));
