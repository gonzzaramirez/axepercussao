"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Minus, Plus, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types"
import { formatPrice, getCategoryLabel } from "@/lib/data"
import { useCartStore } from "@/store/cart"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const setIsOpen = useCartStore((s) => s.setIsOpen)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setIsOpen(true)
    }, 600)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              href="/productos"
              className="transition-colors hover:text-foreground"
            >
              Productos
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="font-medium text-foreground truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.featured && (
              <Badge className="absolute left-4 top-4 rounded-full bg-carnival-primary text-white border-transparent hover:bg-carnival-primary">
                Destacado
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-carnival-accent">
              {product.brand}
            </p>
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
          </div>

          <Badge
            variant="outline"
            className="mb-6 w-fit rounded-full border-border text-xs font-medium text-muted-foreground"
          >
            {getCategoryLabel(product.category)}
          </Badge>

          <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {product.description}
          </p>

          <p className="mb-8 font-display text-4xl text-carnival-primary sm:text-5xl">
            {formatPrice(product.price)}
          </p>

          {/* Selector de cantidad */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">
              Cantidad
            </span>
            <div className="flex items-center rounded-full border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold text-foreground">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Botón agregar al carrito */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full rounded-full bg-carnival-primary px-8 py-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-carnival-primary/25 hover:bg-carnival-primary/90 sm:w-auto"
            disabled={added}
          >
            {added ? (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Agregado
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Agregar al carrito
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
