"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import { products as mockProducts } from "@/lib/data"
import { getProducts } from "@/lib/api/product"
import { getCategories } from "@/lib/api/category"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product, Category } from "@/types"
import { getAvailableVariants } from "@/types"

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(cats)
      })
      .catch(() => {
        setProducts(
          mockProducts.map((p) => ({ ...p, image: p.image || "/placeholder.svg" } as Product))
        )
      })
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filtro por tipo
      if (selectedType && p.productType !== selectedType) return false

      // Filtro por categoría (slug)
      if (selectedCategories.length > 0) {
        const catSlug = p.category?.slug ?? ""
        if (!selectedCategories.includes(catSlug)) return false
      }

      // Filtro por marca (buscar en variantes)
      if (selectedBrands.length > 0) {
        const productBrandSlugs = getAvailableVariants(p)
          .map((v) => v.brand?.slug)
          .filter(Boolean) as string[]
        if (!selectedBrands.some((b) => productBrandSlugs.includes(b))) return false
      }

      return true
    })
  }, [products, selectedCategories, selectedBrands, selectedType])

  const handleCategoryChange = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  const handleBrandChange = (slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    )
  }

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type)
  }

  const handleClearAll = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedType(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge className="mb-3 rounded-full bg-carnival-primary/10 text-carnival-primary border-carnival-primary/20 hover:bg-carnival-primary/10">
          Instrumentos &amp; Accesorios
        </Badge>
        <h1 className="font-display text-5xl tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          CATÁLOGO
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? "s" : ""} encontrado
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <ProductFilters
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              selectedType={selectedType}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onTypeChange={handleTypeChange}
              onClearAll={handleClearAll}
              categories={categories}
            />
          </div>
        </aside>

        <div className="contents lg:hidden">
          <Button
            onClick={() => setShowMobileFilters(true)}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-carnival-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-carnival-primary/20 lg:hidden"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>

          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm lg:hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-card p-6"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    Filtros
                  </h3>
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    variant="outline"
                    size="icon"
                    className="rounded-full border-border bg-transparent"
                    aria-label="Cerrar filtros"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ProductFilters
                  selectedCategories={selectedCategories}
                  selectedBrands={selectedBrands}
                  selectedType={selectedType}
                  onCategoryChange={handleCategoryChange}
                  onBrandChange={handleBrandChange}
                  onTypeChange={handleTypeChange}
                  onClearAll={handleClearAll}
                  categories={categories}
                />
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="mt-6 w-full rounded-full bg-carnival-primary py-6 text-sm font-bold text-white"
                >
                  Ver {filteredProducts.length} resultado
                  {filteredProducts.length !== 1 ? "s" : ""}
                </Button>
              </motion.div>
            </div>
          )}
        </div>

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="mb-2 font-display text-3xl text-foreground">
                SIN RESULTADOS
              </p>
              <p className="text-sm text-muted-foreground">
                Probá ajustando los filtros para encontrar lo que buscás.
              </p>
              <Button
                onClick={handleClearAll}
                variant="link"
                className="mt-2 text-sm font-bold text-carnival-primary"
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
