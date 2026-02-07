"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/data"
import { useCartStore } from "@/store/cart"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const setIsOpen = useCartStore((s) => s.setIsOpen)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setIsOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/productos/${product.slug}`} className="block h-full">
        <Card className="group h-full overflow-hidden border-border bg-card transition-all hover:shadow-xl hover:shadow-carnival-primary/5 hover:-translate-y-1">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.featured && (
              <Badge className="absolute left-3 top-3 rounded-full bg-carnival-primary text-white border-transparent hover:bg-carnival-primary">
                Destacado
              </Badge>
            )}
            <Button
              onClick={handleAddToCart}
              size="icon"
              className="absolute bottom-3 right-3 h-11 w-11 rounded-full bg-carnival-primary text-white opacity-0 shadow-lg transition-all hover:bg-carnival-primary/90 group-hover:opacity-100"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-carnival-accent">
              {product.brand}
            </p>
            <h3 className="mb-2 text-base font-bold text-foreground leading-snug">
              {product.name}
            </h3>
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl text-carnival-primary">
                {formatPrice(product.price)}
              </p>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="sm"
                className="rounded-full border-carnival-primary/20 bg-transparent text-xs font-bold text-carnival-primary hover:bg-carnival-primary hover:text-white"
              >
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
