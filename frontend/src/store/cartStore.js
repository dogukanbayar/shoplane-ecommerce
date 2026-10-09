import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      bundles: [],
      couponDiscount: 0,
      appliedCoupon: null,

      addItem: (product, size = "Standart", color = "Standart", quantity = 1) => {
        if (!product) return;
        set((state) => {
          const currentItems = state.items || [];
          const existingIndex = currentItems.findIndex(
            (item) => item.product?._id === product._id && item.size === size && item.color === color
          );

          if (existingIndex > -1) {
            const updated = [...currentItems];
            updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + Number(quantity);
            return { items: updated };
          }

          const newItem = {
            cartId: `${product._id}-${size}-${color}-${Date.now()}`,
            product: product,
            _id: product._id,
            price: Number(product.price || 0),
            size,
            color,
            quantity: Number(quantity) || 1,
            seller: product.seller || null
          };
          return { items: [...currentItems, newItem] };
        });
      },

      removeItem: (cartId) => {
        set((state) => ({
          items: (state.items || []).filter((item) => (item.cartId || item._id) !== cartId)
        }));
      },

      updateQuantity: (cartId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartId);
          return;
        }
        set((state) => ({
          items: (state.items || []).map((item) =>
            (item.cartId || item._id) === cartId ? { ...item, quantity: Number(quantity) } : item
          )
        }));
      },

      removeBundleFromCart: (bundleId) => {
        set((state) => ({
          bundles: (state.bundles || []).filter((b) => b.bundle?._id !== bundleId)
        }));
      },

      updateBundleQuantity: (bundleId, selectedProducts, quantity) => {
        if (quantity <= 0) {
          get().removeBundleFromCart(bundleId);
          return;
        }
        set((state) => ({
          bundles: (state.bundles || []).map((b) =>
            b.bundle?._id === bundleId ? { ...b, quantity: Number(quantity) } : b
          )
        }));
      },

      clearCart: () => set({ items: [], bundles: [], couponDiscount: 0, appliedCoupon: null }),

      getSubtotal: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => {
          const price = Number(item?.price ?? item?.product?.price ?? 0);
          const qty = Number(item?.quantity ?? 1);
          return sum + (price * qty);
        }, 0);
      },

      getTotalItems: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
      },
      getItemCount: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
      },
      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 500 || subtotal === 0 ? 0 : 29.99;
      },
      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const discountRate = Number(get().couponDiscount || 0);
        return (subtotal * discountRate) / 100;
      },
      getTotal: () => {
        const items = get().items || [];
        const bundles = get().bundles || [];

        const itemsTotal = items.reduce((sum, item) => {
          const price = Number(item?.price ?? item?.product?.price ?? 0);
          const qty = Number(item?.quantity ?? 1);
          return sum + (price * qty);
        }, 0);

        const bundlesTotal = bundles.reduce((sum, b) => {
          const price = Number(b?.price ?? 0);
          const qty = Number(b?.quantity ?? 1);
          return sum + (price * qty);
        }, 0);

        const shipping = itemsTotal >= 500 || itemsTotal === 0 ? 0 : 29.99;
        const discountRate = Number(get().couponDiscount || 0);
        const discount = (itemsTotal * discountRate) / 100;

        return Math.max(0, itemsTotal + shipping - discount + bundlesTotal);
      }
    }),
    {
      name: "cart-storage"
    }
  )
);

export default useCartStore;
