import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, CartItem } from "@/types"
import { formatPrice } from "@/lib/data"

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setIsOpen: (open: boolean) => void
  totalItems: () => number
  totalPrice: () => number
  buildWhatsAppUrl: () => string
}

const WHATSAPP_NUMBER = "5491100000000"

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }
          return { items: [...state.items, { product, quantity: 1 }] }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      setIsOpen: (open: boolean) => set({ isOpen: open }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      buildWhatsAppUrl: () => {
        const items = get().items
        const total = get().totalPrice()
        const itemLines = items
          .map(
            (item) =>
              `- ${item.quantity}x ${item.product.name} (${formatPrice(item.product.price * item.quantity)})`
          )
          .join("\n")

        const message = `Hola Axé Percussão! Quiero realizar el siguiente pedido:\n\n${itemLines}\n\nTotal: ${formatPrice(total)}`

        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
      },
    }),
    {
      name: "axe-cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
)
