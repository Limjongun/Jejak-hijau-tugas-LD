import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Product, EcoImpactCalculation } from "@/types";
import { calculateImpact, calculateEcoPoints } from "@/lib/eco-impact";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  toggleCart: () => void;

  // Computations
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
  getImpact: () => EcoImpactCalculation;
  getEstimatedPoints: (isPlasticFree?: boolean) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === product.id
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingItemIndex];
            const newQuantity = Math.min(
              currentItem.quantity + quantity,
              product.stock
            );
            updatedItems[existingItemIndex] = {
              ...currentItem,
              quantity: newQuantity,
            };
            return { items: updatedItems, isOpen: true };
          }

          const safeQuantity = Math.min(quantity, product.stock);
          return {
            items: [
              ...state.items,
              { productId: product.id, product, quantity: safeQuantity },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          const updatedItems = state.items.map((item) => {
            if (item.productId === productId) {
              const maxStock = item.product.stock;
              return {
                ...item,
                quantity: Math.min(quantity, maxStock),
              };
            }
            return item;
          });

          return { items: updatedItems };
        });
      },

      clearCart: () => set({ items: [] }),

      setOpen: (open: boolean) => set({ isOpen: open }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );
      },

      getTotalWeight: () => {
        return get().items.reduce(
          (acc, item) => acc + item.product.weightGram * item.quantity,
          0
        );
      },

      getImpact: () => {
        return calculateImpact(get().items);
      },

      getEstimatedPoints: (isPlasticFree = false) => {
        return calculateEcoPoints(get().getSubtotal(), {
          isPlasticFreePackage: isPlasticFree,
        });
      },
    }),
    {
      name: "jejakhijau-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
