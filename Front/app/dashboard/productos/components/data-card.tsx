"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/types"
import { Package, Pencil, RotateCcw, Star, Trash2, Wrench } from "lucide-react"

interface ProductsDataCardProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onRestore: (product: Product) => void
  formatPrice: (price: number) => string
  search: string
}

const REGISTER_COLORS: Record<string, string> = {
  AGUDO: "bg-blue-100 text-blue-800",
  MEDIO: "bg-amber-100 text-amber-800",
  GRAVE: "bg-emerald-100 text-emerald-800",
}

const REGISTER_LABELS: Record<string, string> = {
  AGUDO: "Agudo",
  MEDIO: "Medio",
  GRAVE: "Grave",
}

export function ProductsDataCard({
  products,
  onEdit,
  onDelete,
  onRestore,
  formatPrice,
  search,
}: ProductsDataCardProps) {
  if (products.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <Package className="h-10 w-10 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">
            No se encontraron productos
          </p>
          <p className="text-xs text-gray-400">
            {search
              ? "Probá con otro término de búsqueda"
              : "Creá tu primer producto para empezar"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Card
          key={product.id}
          className="transition-all active:scale-[0.998]"
          onClick={() => onEdit(product)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {product.imageUrl ? (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-gray-50 text-gray-300">
                  {product.productType === "INSTRUMENT" ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <Wrench className="h-5 w-5" />
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  {product.isFeatured && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                  <p className="truncate font-semibold text-gray-900">
                    {product.name}
                  </p>
                </div>
                <p className="truncate font-mono text-xs text-gray-400">
                  {product.sku || "Sin SKU"}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="text-xs">
                    {product.productType === "INSTRUMENT"
                      ? "Instrumento"
                      : "Accesorio"}
                  </Badge>
                  {product.instrumentRegister && (
                    <Badge
                      className={`border-transparent text-xs ${REGISTER_COLORS[product.instrumentRegister]}`}
                    >
                      {REGISTER_LABELS[product.instrumentRegister]}
                    </Badge>
                  )}
                  <Badge
                    className={
                      product.isActive
                        ? "border-transparent bg-green-100 text-green-800"
                        : "border-transparent bg-gray-100 text-gray-600"
                    }
                  >
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Categoría
                </p>
                <p className="truncate text-sm font-medium text-gray-800">
                  {product.category?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Variantes activas
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {product.variants?.filter((variant) => variant.isActive).length || 0}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Precio base
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {product.price ? formatPrice(product.price) : "—"}
                </p>
              </div>
            </div>

            <div
              className="mt-4 flex items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => onEdit(product)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              {product.isActive ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(product)}
                  aria-label="Dar de baja producto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  className="text-emerald-600 hover:text-emerald-700"
                  onClick={() => onRestore(product)}
                  aria-label="Restaurar producto"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
