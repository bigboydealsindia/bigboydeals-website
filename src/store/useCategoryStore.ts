import { create } from "zustand";

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: number | null;
  sortOrder: number; // Naya property drag and drop ke liye
  createdAt: Date;
}

interface CategoryState {
  categories: Category[];
  isLoaded: boolean;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoaded: false,
  setCategories: (categories) => set({ categories, isLoaded: true }),
}));
