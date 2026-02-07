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
import { categories, brands } from "@/lib/data"
import type { Category, Brand } from "@/types"

interface ProductFiltersProps {
  selectedCategories: Category[]
  selectedBrands: Brand[]
  onCategoryChange: (category: Category) => void
  onBrandChange: (brand: Brand) => void
  onClearAll: () => void
}

export function ProductFilters({
  selectedCategories,
  selectedBrands,
  onCategoryChange,
  onBrandChange,
  onClearAll,
}: ProductFiltersProps) {
  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0

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

        <Accordion type="multiple" defaultValue={["category", "brand"]}>
          <AccordionItem value="category" className="border-border">
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
              Categoria
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
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

          <AccordionItem value="brand" className="border-border">
            <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
              Marca
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                {brands.map((brand) => (
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
