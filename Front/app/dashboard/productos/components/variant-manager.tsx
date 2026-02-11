"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Brand } from "@/types"
import { Plus, Shuffle, Trash2, Copy, AlertCircle } from "lucide-react"

// ─── Tipos ──────────────────────────────────────────

export interface VariantFormItem {
  id?: string
  tempId: string
  brandId?: number
  sku: string
  size: string
  model: string
  material: string
  price: number
  stockQuantity: number
  imageUrl: string
  isActive: boolean
}

interface VariantManagerProps {
  variants: VariantFormItem[]
  setVariants: (variants: VariantFormItem[]) => void
  brands: Brand[]
  productSku: string
}

// ─── Helpers ────────────────────────────────────────

function generateSku(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p) =>
      p
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]+/g, "")
        .slice(0, 6)
    )
    .join("-")
}

function uniqueTempId(): string {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Componente ─────────────────────────────────────

export function VariantManager({
  variants,
  setVariants,
  brands,
  productSku,
}: VariantManagerProps) {
  const [genDialogOpen, setGenDialogOpen] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<Set<number>>(new Set())
  const [genSizes, setGenSizes] = useState("")
  const [genModels, setGenModels] = useState("")
  const [genMaterials, setGenMaterials] = useState("")
  const [bulkPrice, setBulkPrice] = useState("")

  // ─── Agregar variante individual ────

  const addSingleVariant = () => {
    setVariants([
      ...variants,
      {
        tempId: uniqueTempId(),
        sku: "",
        size: "",
        model: "",
        material: "",
        price: 0,
        stockQuantity: 0,
        imageUrl: "",
        isActive: true,
      },
    ])
  }

  // ─── Actualizar campo de variante ────

  const updateVariant = (
    index: number,
    field: keyof VariantFormItem,
    value: any
  ) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-generar SKU cuando cambian los campos relevantes
    if (["brandId", "size", "model", "material"].includes(field)) {
      const v = updated[index]
      const brandName = brands.find((b) => b.id === v.brandId)?.name || ""
      updated[index].sku = generateSku(
        productSku,
        brandName,
        v.size,
        v.model,
        v.material
      )
    }

    setVariants(updated)
  }

  // ─── Eliminar variante ────

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // ─── Abrir diálogo de generación ────

  const openGenerateDialog = () => {
    setSelectedBrands(new Set())
    setGenSizes("")
    setGenModels("")
    setGenMaterials("")
    setGenDialogOpen(true)
  }

  // ─── Generar combinaciones ────

  const generateCombinations = () => {
    const brandIds = Array.from(selectedBrands)
    const sizes = genSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const models = genModels
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const materials = genMaterials
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (brandIds.length === 0) return

    const sizeList = sizes.length > 0 ? sizes : [""]
    const modelList = models.length > 0 ? models : [""]
    const materialList = materials.length > 0 ? materials : [""]

    const newVariants: VariantFormItem[] = []

    for (const brandId of brandIds) {
      const brandName = brands.find((b) => b.id === brandId)?.name || ""
      for (const size of sizeList) {
        for (const model of modelList) {
          for (const material of materialList) {
            const sku = generateSku(
              productSku,
              brandName,
              size,
              model,
              material
            )

            // Evitar duplicados
            const exists = variants.some((v) => v.sku === sku)
            if (exists) continue

            newVariants.push({
              tempId: uniqueTempId(),
              brandId,
              sku,
              size,
              model,
              material,
              price: 0,
              stockQuantity: 0,
              imageUrl: "",
              isActive: true,
            })
          }
        }
      }
    }

    setVariants([...variants, ...newVariants])
    setGenDialogOpen(false)
  }

  // ─── Aplicar precio masivo ────

  const applyBulkPrice = () => {
    const price = parseInt(bulkPrice)
    if (!price || price <= 0) return
    setVariants(variants.map((v) => ({ ...v, price })))
    setBulkPrice("")
  }

  // ─── Toggle marca en generador ────

  const toggleBrand = (brandId: number) => {
    const newSet = new Set(selectedBrands)
    if (newSet.has(brandId)) {
      newSet.delete(brandId)
    } else {
      newSet.add(brandId)
    }
    setSelectedBrands(newSet)
  }

  // ─── Preview del generador ────

  const previewCount = (() => {
    const brandCount = selectedBrands.size
    if (brandCount === 0) return 0
    const sizes =
      genSizes
        .split(",")
        .filter((s) => s.trim()).length || 1
    const models =
      genModels
        .split(",")
        .filter((s) => s.trim()).length || 1
    const materials =
      genMaterials
        .split(",")
        .filter((s) => s.trim()).length || 1
    return brandCount * sizes * models * materials
  })()

  return (
    <div>
      {/* ─── Barra de acciones ─── */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openGenerateDialog}
          >
            <Shuffle className="mr-1.5 h-3.5 w-3.5" />
            Generar combinaciones
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSingleVariant}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar individual
          </Button>
        </div>

        {variants.length > 0 && (
          <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <Input
              type="number"
              placeholder="Precio para todas"
              className="h-8 flex-1 text-sm sm:w-44 sm:flex-none"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={applyBulkPrice}
              disabled={!bulkPrice}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Aplicar a todas
            </Button>
          </div>
        )}
      </div>

      {/* ─── Tabla de variantes ─── */}
      {variants.length > 0 ? (
        <div className="space-y-3">
          <div className="md:hidden space-y-3">
            {variants.map((variant, index) => (
              <div
                key={variant.tempId}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Variante {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-destructive"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="mb-1.5 block text-xs">Marca</Label>
                    <Select
                      value={variant.brandId?.toString() || "0"}
                      onValueChange={(v) =>
                        updateVariant(
                          index,
                          "brandId",
                          parseInt(v) || undefined
                        )
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Marca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin marca</SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id.toString()}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1.5 block text-xs">Medida</Label>
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                        className="h-9 text-xs"
                        placeholder='ej: 14"'
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs">Modelo</Label>
                      <Input
                        value={variant.model}
                        onChange={(e) =>
                          updateVariant(index, "model", e.target.value)
                        }
                        className="h-9 text-xs"
                        placeholder="ej: 2 bocas"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs">Material</Label>
                    <Input
                      value={variant.material}
                      onChange={(e) =>
                        updateVariant(index, "material", e.target.value)
                      }
                      className="h-9 text-xs"
                      placeholder="ej: Cuero"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs">
                      Imagen de la variante
                    </Label>
                    <Input
                      value={variant.imageUrl}
                      onChange={(e) =>
                        updateVariant(index, "imageUrl", e.target.value)
                      }
                      className="h-9 text-xs"
                      placeholder="URL (opcional, si no toma la del producto)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1.5 block text-xs">Precio (ARS)</Label>
                      <Input
                        type="number"
                        value={variant.price || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-9 text-xs"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs">Stock</Label>
                      <Input
                        type="number"
                        value={variant.stockQuantity || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stockQuantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-9 text-xs"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden rounded-lg border border-gray-200 overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[150px] text-xs">Marca</TableHead>
                  <TableHead className="w-[100px] text-xs">Medida</TableHead>
                  <TableHead className="w-[120px] text-xs">Modelo</TableHead>
                  <TableHead className="w-[100px] text-xs">Material</TableHead>
                  <TableHead className="w-[180px] text-xs">Imagen</TableHead>
                  <TableHead className="w-[110px] text-xs">Precio (ARS)</TableHead>
                  <TableHead className="w-[80px] text-xs">Stock</TableHead>
                  <TableHead className="w-[44px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <TableRow key={variant.tempId} className="group">
                    <TableCell className="p-1.5">
                      <Select
                        value={variant.brandId?.toString() || "0"}
                        onValueChange={(v) =>
                          updateVariant(
                            index,
                            "brandId",
                            parseInt(v) || undefined
                          )
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Marca" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sin marca</SelectItem>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={b.id.toString()}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                        className="h-8 text-xs"
                        placeholder='ej: 14"'
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        value={variant.model}
                        onChange={(e) =>
                          updateVariant(index, "model", e.target.value)
                        }
                        className="h-8 text-xs"
                        placeholder="ej: 2 bocas"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        value={variant.material}
                        onChange={(e) =>
                          updateVariant(index, "material", e.target.value)
                        }
                        className="h-8 text-xs"
                        placeholder="ej: Cuero"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        value={variant.imageUrl}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "imageUrl",
                            e.target.value
                          )
                        }
                        className="h-8 text-xs"
                        placeholder="URL imagen (opcional)"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        type="number"
                        value={variant.price || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-8 text-xs"
                        placeholder="$0"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        type="number"
                        value={variant.stockQuantity || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stockQuantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-8 text-xs"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
          <Shuffle className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No hay variantes definidas
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-gray-400">
            Usá &quot;Generar combinaciones&quot; para crear variantes
            automáticamente por marca, medida y modelo, o agregá una
            individualmente.
          </p>
        </div>
      )}

      {/* ─── Diálogo: Generar Combinaciones ─── */}
      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generar combinaciones de variantes</DialogTitle>
            <DialogDescription>
              Seleccioná las marcas y completá las opciones. Se generarán todas
              las combinaciones posibles automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Marcas */}
            <div>
              <Label className="mb-2.5 block text-sm font-semibold">
                Marcas *
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-sm transition-all ${
                      selectedBrands.has(brand.id)
                        ? "border-blue-500 bg-blue-50 font-medium text-blue-900"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedBrands.has(brand.id)}
                      onCheckedChange={() => toggleBrand(brand.id)}
                    />
                    {brand.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Medidas */}
            <div>
              <Label className="mb-1.5 block">Medidas</Label>
              <Input
                value={genSizes}
                onChange={(e) => setGenSizes(e.target.value)}
                placeholder='ej: 12", 14", 16", 18"'
              />
              <p className="mt-1 text-xs text-gray-400">
                Separar por coma. Dejar vacío si no aplica.
              </p>
            </div>

            {/* Modelos */}
            <div>
              <Label className="mb-1.5 block">Modelos</Label>
              <Input
                value={genModels}
                onChange={(e) => setGenModels(e.target.value)}
                placeholder="ej: 2 bocas, 4 bocas"
              />
              <p className="mt-1 text-xs text-gray-400">
                Separar por coma. Dejar vacío si no aplica.
              </p>
            </div>

            {/* Materiales */}
            <div>
              <Label className="mb-1.5 block">Materiales</Label>
              <Input
                value={genMaterials}
                onChange={(e) => setGenMaterials(e.target.value)}
                placeholder="ej: Plástico, Cuero"
              />
              <p className="mt-1 text-xs text-gray-400">
                Separar por coma. Dejar vacío si no aplica.
              </p>
            </div>

            {/* Preview */}
            {selectedBrands.size > 0 && (
              <div className="rounded-lg bg-blue-50 p-3.5">
                <p className="text-sm font-semibold text-blue-900">
                  Se generarán {previewCount} variante
                  {previewCount !== 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-xs text-blue-700">
                  {selectedBrands.size} marca
                  {selectedBrands.size !== 1 ? "s" : ""}
                  {genSizes &&
                    ` × ${genSizes.split(",").filter((s) => s.trim()).length} medida(s)`}
                  {genModels &&
                    ` × ${genModels.split(",").filter((s) => s.trim()).length} modelo(s)`}
                  {genMaterials &&
                    ` × ${genMaterials.split(",").filter((s) => s.trim()).length} material(es)`}
                </p>
              </div>
            )}

            {selectedBrands.size === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Seleccioná al menos una marca para generar variantes.
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setGenDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={generateCombinations}
              disabled={selectedBrands.size === 0}
              className="w-full sm:w-auto"
            >
              Generar {previewCount > 0 ? previewCount : ""} variante
              {previewCount !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
