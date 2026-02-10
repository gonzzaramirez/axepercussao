"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Product, CartItem, ProductVariant } from "@/types"
import { formatPrice } from "@/lib/data"
import { getEffectivePrice, getVariantDescription } from "@/types"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  buildWhatsAppUrl: () => string
}

const CartContext = createContext<CartContextType | null>(null)

/** Genera una key única para cada item en el carrito */
function cartItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}-${variantId}` : productId
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hidratar desde sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("axe-cart")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch {
      // sessionStorage no disponible
    }
    setIsHydrated(true)
  }, [])

  // Persistir en sessionStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      sessionStorage.setItem("axe-cart", JSON.stringify(items))
    } catch {
      // sessionStorage no disponible
    }
  }, [items, isHydrated])

  const addItem = useCallback(
    (product: Product, variant?: ProductVariant) => {
      setItems((prev) => {
        const key = cartItemKey(product.id, variant?.id)
        const existing = prev.find(
          (item) => cartItemKey(item.product.id, item.selectedVariant?.id) === key
        )

        if (existing) {
          return prev.map((item) =>
            cartItemKey(item.product.id, item.selectedVariant?.id) === key
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }

        return [...prev, { product, quantity: 1, selectedVariant: variant }]
      })
    },
    []
  )

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => cartItemKey(item.product.id, item.selectedVariant?.id) !== cartItemKey(productId, variantId)
      )
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId)
        return
      }
      setItems((prev) =>
        prev.map((item) => {
          const match =
            cartItemKey(item.product.id, item.selectedVariant?.id) === cartItemKey(productId, variantId)
          return match ? { ...item, quantity } : item
        })
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => {
    const price = getEffectivePrice(item.product, item.selectedVariant)
    return total + price * item.quantity
  }, 0)

  const buildWhatsAppUrl = useCallback(() => {
    const WHATSAPP_NUMBER =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59899999999"

    const itemLines = items
      .map((item) => {
        const price = getEffectivePrice(item.product, item.selectedVariant)
        const variantPart = item.selectedVariant
          ? ` (${getVariantDescription(item.selectedVariant)})`
          : ""
        return `- ${item.quantity}x ${item.product.name}${variantPart} ${formatPrice(price * item.quantity)}`
      })
      .join("\n")

    const message = `Hola Axé Percussão! Quiero realizar el siguiente pedido:\n\n${itemLines}\n\nTotal: ${formatPrice(totalPrice)}`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }, [items, totalPrice])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
        buildWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider")
  }
  return context
}
