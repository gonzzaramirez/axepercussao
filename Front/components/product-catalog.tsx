"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Category, Brand } from "@/types"

export function ProductCatalog() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category)
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand)
      return matchesCategory && matchesBrand
    })
  }, [selectedCategories, selectedBrands])

  const handleCategoryChange = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const handleClearAll = () => {
    setSelectedCategories([])
    setSelectedBrands([])
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
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onClearAll={handleClearAll}
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
                  onCategoryChange={handleCategoryChange}
                  onBrandChange={handleBrandChange}
                  onClearAll={handleClearAll}
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
