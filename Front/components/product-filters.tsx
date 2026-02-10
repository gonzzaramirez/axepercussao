"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { categoryFilters, brandFilters } from "@/lib/data"
import type { Category } from "@/types"

interface ProductFiltersProps {
  selectedCategories: string[]
  selectedBrands: string[]
  selectedType: string | null
  onCategoryChange: (slug: string) => void
  onBrandChange: (slug: string) => void
  onTypeChange: (type: string | null) => void
  onClearAll: () => void
  /** Categorías desde API (opcional). Si no se pasa, usa las estáticas de lib/data */
  categories?: Category[]
}

export function ProductFilters({
  selectedCategories,
  selectedBrands,
  selectedType,
  onCategoryChange,
  onBrandChange,
  onTypeChange,
  onClearAll,
  categories,
}: ProductFiltersProps) {
  const hasFilters =
    selectedCategories.length > 0 || selectedBrands.length > 0 || selectedType !== null

  const categoryOptions = categories?.length
    ? categories.map((c) => ({ value: c.slug, label: c.name }))
    : categoryFilters

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Filtros
          </h3>
          {hasFilters && (
            <Button
              onClick={onClearAll}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-semibold text-carnival-primary hover:bg-transparent hover:text-carnival-primary/80"
            >
              Limpiar todo
            </Button>
          )}
        </div>

        <Accordion type="multiple" defaultValue={["type", "category", "brand"]}>
          {/* Tipo de producto */}
          <AccordionItem value="type" className="border-border">
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
              Tipo
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {[
                  { value: "INSTRUMENT", label: "Instrumentos" },
                  { value: "ACCESSORY", label: "Accesorios" },
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Checkbox
                      checked={selectedType === type.value}
                      onCheckedChange={() =>
                        onTypeChange(selectedType === type.value ? null : type.value)
                      }
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Categoría */}
          <AccordionItem value="category" className="border-border">
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
              Categoría
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {categoryOptions.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(cat.value)}
                      onCheckedChange={() => onCategoryChange(cat.value)}
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Marca */}
          <AccordionItem value="brand" className="border-border">
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
              Marca
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {brandFilters.map((brand) => (
                  <label
                    key={brand.value}
                    className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Checkbox
                      checked={selectedBrands.includes(brand.value)}
                      onCheckedChange={() => onBrandChange(brand.value)}
                    />
                    {brand.label}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
