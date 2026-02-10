"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Minus, Plus, ChevronRight, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product, ProductVariant } from "@/types"
import { getEffectivePrice, getVariantDescription, getAvailableVariants } from "@/types"
import { formatPrice, registerLabels } from "@/lib/data"
import { useCart } from "@/context/cart-context"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem, setIsOpen } = useCart()

  const variants = getAvailableVariants(product)
  const hasVariants = variants.length > 0

  // Extraer opciones únicas de las variantes
  const uniqueBrands = useMemo(() => {
    const map = new Map<number, { id: number; name: string; slug: string }>()
    for (const v of variants) {
      if (v.brand && v.brandId) map.set(v.brandId, v.brand)
    }
    return Array.from(map.values())
  }, [variants])

  const uniqueSizes = useMemo(() => {
    const set = new Set<string>()
    for (const v of variants) {
      if (v.size) set.add(v.size)
    }
    return Array.from(set)
  }, [variants])

  const uniqueModels = useMemo(() => {
    const set = new Set<string>()
    for (const v of variants) {
      if (v.model) set.add(v.model)
    }
    return Array.from(set)
  }, [variants])

  const uniqueMaterials = useMemo(() => {
    const set = new Set<string>()
    for (const v of variants) {
      if (v.material) set.add(v.material)
    }
    return Array.from(set)
  }, [variants])

  // Estado de selección
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(
    uniqueBrands.length === 1 ? uniqueBrands[0].id : null
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(
    uniqueSizes.length === 1 ? uniqueSizes[0] : null
  )
  const [selectedModel, setSelectedModel] = useState<string | null>(
    uniqueModels.length === 1 ? uniqueModels[0] : null
  )
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    uniqueMaterials.length === 1 ? uniqueMaterials[0] : null
  )

  // Encontrar la variante seleccionada
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!hasVariants) return undefined
    return variants.find((v) => {
      if (uniqueBrands.length > 0 && v.brandId !== selectedBrandId) return false
      if (uniqueSizes.length > 0 && v.size !== selectedSize) return false
      if (uniqueModels.length > 0 && v.model !== selectedModel) return false
      if (uniqueMaterials.length > 0 && v.material !== selectedMaterial) return false
      return true
    })
  }, [variants, hasVariants, selectedBrandId, selectedSize, selectedModel, selectedMaterial, uniqueBrands.length, uniqueSizes.length, uniqueModels.length, uniqueMaterials.length])

  const effectivePrice = getEffectivePrice(product, selectedVariant)
  const displayImage = selectedVariant?.imageUrl || product.image || "/placeholder.svg"
  const isSelectionComplete = !hasVariants || !!selectedVariant
  const stock = selectedVariant?.stockQuantity ?? product.stockQuantity ?? 0

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) return
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant)
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
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li>
            <Link href="/productos" className="transition-colors hover:text-foreground">
              Productos
            </Link>
          </li>
          {product.category && (
            <>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link href={`/productos?cat=${product.category.slug}`} className="transition-colors hover:text-foreground">
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
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
              src={displayImage}
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
            {product.instrumentRegister && (
              <Badge variant="outline" className="absolute right-4 top-4 rounded-full border-white/30 bg-black/40 text-white backdrop-blur-sm">
                {registerLabels[product.instrumentRegister] || product.instrumentRegister}
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
          <div className="mb-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {product.category && (
                <Badge variant="outline" className="rounded-full border-border text-xs font-medium text-muted-foreground">
                  {product.category.name}
                </Badge>
              )}
              {product.productType && (
                <Badge variant="outline" className="rounded-full border-border text-xs font-medium text-muted-foreground">
                  {product.productType === "INSTRUMENT" ? "Instrumento" : "Accesorio"}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
          </div>

          {selectedVariant?.brand && (
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-carnival-accent">
              {selectedVariant.brand.name}
            </p>
          )}

          <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {product.description}
          </p>

          {/* Selectores de variante */}
          {hasVariants && (
            <div className="mb-6 space-y-5">
              {/* Marca */}
              {uniqueBrands.length > 1 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Marca</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrandId(brand.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          selectedBrandId === brand.id
                            ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Medida */}
              {uniqueSizes.length > 1 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Medida</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          selectedSize === size
                            ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modelo */}
              {uniqueModels.length > 1 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Modelo</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          selectedModel === model
                            ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material */}
              {uniqueMaterials.length > 1 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Material</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueMaterials.map((material) => (
                      <button
                        key={material}
                        onClick={() => setSelectedMaterial(material)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          selectedMaterial === material
                            ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de variante seleccionada */}
              {selectedVariant && (
                <div className="flex items-start gap-2 rounded-lg border border-carnival-primary/20 bg-carnival-primary/5 px-4 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-carnival-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {getVariantDescription(selectedVariant)}
                    </p>
                    <p className="text-muted-foreground">
                      SKU: {selectedVariant.sku} · Stock: {selectedVariant.stockQuantity} unid.
                    </p>
                  </div>
                </div>
              )}

              {hasVariants && !selectedVariant && (selectedBrandId || selectedSize || selectedModel || selectedMaterial) && (
                <p className="text-sm text-amber-600">
                  Seleccioná todas las opciones para ver disponibilidad.
                </p>
              )}
            </div>
          )}

          {/* Precio */}
          <p className="mb-6 font-display text-4xl text-carnival-primary sm:text-5xl">
            {formatPrice(effectivePrice)}
          </p>

          {/* Selector de cantidad */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">Cantidad</span>
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
                disabled={hasVariants && stock > 0 && quantity >= stock}
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {hasVariants && stock > 0 && stock <= 5 && (
              <span className="text-xs text-amber-600">
                ¡Quedan {stock}!
              </span>
            )}
          </div>

          {/* Botón agregar al carrito */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full rounded-full bg-carnival-primary px-8 py-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-carnival-primary/25 hover:bg-carnival-primary/90 sm:w-auto"
            disabled={added || !isSelectionComplete}
          >
            {added ? (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Agregado
              </span>
            ) : !isSelectionComplete ? (
              <span className="flex items-center gap-2">
                Seleccioná las opciones
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
