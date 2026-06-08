import { create } from "zustand";

export interface CartItem {
  id: number;
  productId: number;
  color: string;
  size: string;
  quantity: number;
  codAdvance?: number; // NAYA FIELD ADDED
}

interface CartState {
  cartItems: CartItem[];
  isLoaded: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appliedCoupon: any | null;
  setCartItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAppliedCoupon: (coupon: any | null) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  isLoaded: false,
  appliedCoupon: null,

  setCartItems: (items) => set({ cartItems: items, isLoaded: true }),

  addItem: (item) =>
    set((state) => {
      const exists = state.cartItems.some(
        (i) =>
          i.productId === item.productId &&
          i.color === item.color &&
          i.size === item.size,
      );
      if (exists) return state;
      return { cartItems: [...state.cartItems, item] };
    }),

  removeItem: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    })),

  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
}));
