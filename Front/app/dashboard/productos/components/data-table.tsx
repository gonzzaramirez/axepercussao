"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Product } from "@/types"
import { Package, Pencil, Star, Trash2, Wrench } from "lucide-react"

interface ProductsDataTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
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

export function ProductsDataTable({
  products,
  onEdit,
  onDelete,
  formatPrice,
  search,
}: ProductsDataTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80">
            <TableHead className="w-[280px]">Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Variantes</TableHead>
            <TableHead>Precio base</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[100px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => onEdit(product)}
            >
              <TableCell>
                <div className="flex items-start gap-3">
                  {product.imageUrl ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-gray-300">
                      {product.productType === "INSTRUMENT" ? (
                        <Package className="h-4 w-4" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {product.isFeatured && (
                        <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                      <p className="truncate font-medium text-gray-900">
                        {product.name}
                      </p>
                    </div>
                    <p className="truncate font-mono text-xs text-gray-400">
                      {product.sku}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm text-gray-600">
                  {product.category?.name || "—"}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="w-fit text-xs">
                    {product.productType === "INSTRUMENT"
                      ? "Instrumento"
                      : "Accesorio"}
                  </Badge>
                  {product.instrumentRegister && (
                    <Badge
                      className={`w-fit border-transparent text-xs ${REGISTER_COLORS[product.instrumentRegister]}`}
                    >
                      {REGISTER_LABELS[product.instrumentRegister]}
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm font-medium text-gray-700">
                  {product.variants?.filter((variant) => variant.isActive).length || 0}
                </span>
                <span className="text-xs text-gray-400"> var.</span>
              </TableCell>

              <TableCell>
                <span className="font-semibold text-gray-900">
                  {product.price ? formatPrice(product.price) : "—"}
                </span>
              </TableCell>

              <TableCell>
                <Badge
                  className={
                    product.isActive
                      ? "border-transparent bg-green-100 text-green-800"
                      : "border-transparent bg-gray-100 text-gray-600"
                  }
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>

              <TableCell
                className="text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">
                    No se encontraron productos
                  </p>
                  <p className="text-xs text-gray-400">
                    {search
                      ? "Probá con otro término de búsqueda"
                      : "Creá tu primer producto para empezar"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
