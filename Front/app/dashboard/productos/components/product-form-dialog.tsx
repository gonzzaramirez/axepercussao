"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createProduct, updateProduct } from "@/lib/api/product"
import type { Product, Category, Brand } from "@/types"
import { Loader2, Drum, Wrench, ImageIcon } from "lucide-react"
import { VariantManager, type VariantFormItem } from "./variant-manager"
import { toast } from "sonner"

// ─── Props ──────────────────────────────────────────

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: Category[]
  brands: Brand[]
  onSaved: () => void
}

// ─── Tipo del formulario ────────────────────────────

interface ProductForm {
  name: string
  slug: string
  sku: string
  description: string
  shortDescription: string
  price: number
  stockQuantity: number
  imageUrl: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  categoryId: number
  productType: "INSTRUMENT" | "ACCESSORY"
  instrumentRegister: string
  requiresAvailabilityCheck: boolean
  discountPercent: number
  discountStartDate: string
  discountEndDate: string
  minQuantityDiscount: number
  quantityDiscountPercent: number
}

// ─── Helpers ────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function skuify(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDescription: "",
  price: 0,
  stockQuantity: 0,
  imageUrl: "",
  images: [],
  isActive: true,
  isFeatured: false,
  categoryId: 0,
  productType: "INSTRUMENT",
  instrumentRegister: "",
  requiresAvailabilityCheck: false,
  discountPercent: 0,
  discountStartDate: "",
  discountEndDate: "",
  minQuantityDiscount: 0,
  quantityDiscountPercent: 0,
}

// Categorías de instrumentos (slugs del seed)
const INSTRUMENT_CATEGORY_SLUGS = ["agudos", "medios", "graves"]

// ─── Componente ─────────────────────────────────────

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  brands,
  onSaved,
}: ProductFormDialogProps) {
  const isEditing = !!product
  const [saving, setSaving] = useState(false)
  const [variants, setVariants] = useState<VariantFormItem[]>([])
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)

  // Separar categorías por tipo
  const instrumentCategories = categories.filter((c) =>
    INSTRUMENT_CATEGORY_SLUGS.includes(c.slug)
  )
  const accessoryCategories = categories.filter(
    (c) => !INSTRUMENT_CATEGORY_SLUGS.includes(c.slug)
  )

  // Inicializar formulario cuando se abre el diálogo
  useEffect(() => {
    if (!open) return

    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        sku: product.sku || "",
        description: product.description,
        shortDescription: product.shortDescription || "",
        price: product.price || 0,
        stockQuantity: product.stockQuantity ?? 0,
        imageUrl: product.imageUrl || "",
        images: product.images || [],
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        categoryId: product.categoryId ?? 0,
        productType: product.productType || "INSTRUMENT",
        instrumentRegister: product.instrumentRegister || "",
        requiresAvailabilityCheck:
          product.requiresAvailabilityCheck ?? false,
        discountPercent: product.discountPercent ?? 0,
        discountStartDate: product.discountStartDate
          ? product.discountStartDate.split("T")[0]
          : "",
        discountEndDate: product.discountEndDate
          ? product.discountEndDate.split("T")[0]
          : "",
        minQuantityDiscount: product.minQuantityDiscount ?? 0,
        quantityDiscountPercent: product.quantityDiscountPercent ?? 0,
      })

      // Cargar variantes existentes (solo activas)
      setVariants(
        (product.variants || [])
          .filter((v) => v.isActive)
          .map((v) => ({
            id: v.id,
            tempId: v.id,
            brandId: v.brandId ?? undefined,
            sku: v.sku,
            size: v.size || "",
            model: v.model || "",
            material: v.material || "",
            price: v.price ?? 0,
            stockQuantity: v.stockQuantity ?? 0,
            imageUrl: v.imageUrl || "",
            isActive: v.isActive,
          }))
      )
    } else {
      setForm(EMPTY_FORM)
      setVariants([])
    }
  }, [open, product])

  // ─── Actualizar campo del formulario ────

  const updateField = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      // Auto-generar slug y SKU desde el nombre (solo al crear)
      if (field === "name" && !isEditing) {
        next.slug = slugify(value as string)
        next.sku = skuify(value as string)
      }

      // Limpiar registro si cambia a accesorio
      if (field === "productType" && value === "ACCESSORY") {
        next.instrumentRegister = ""
      }

      return next
    })
  }

  // ─── Guardar ────

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.slug.trim() ||
      !form.sku.trim() ||
      !form.description.trim()
    ) {
      toast.error(
        "Completá los campos obligatorios: nombre, slug, SKU y descripción"
      )
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        price: form.price || undefined,
        stockQuantity: form.stockQuantity || 0,
        imageUrl: form.imageUrl.trim() || undefined,
        images: form.images.filter(Boolean),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        categoryId: form.categoryId || undefined,
        productType: form.productType,
        instrumentRegister:
          form.productType === "INSTRUMENT" && form.instrumentRegister
            ? form.instrumentRegister
            : undefined,
        requiresAvailabilityCheck: form.requiresAvailabilityCheck,
        variants: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          sku: v.sku || `${form.sku}-${v.tempId.slice(-5)}`.toUpperCase(),
          brandId: v.brandId || undefined,
          size: v.size || undefined,
          model: v.model || undefined,
          material: v.material || undefined,
          price: v.price || undefined,
          stockQuantity: v.stockQuantity || 0,
          isActive: v.isActive,
        })),
      }

      // Descuentos
      if (form.discountPercent > 0) {
        payload.discountPercent = form.discountPercent
        if (form.discountStartDate)
          payload.discountStartDate = form.discountStartDate
        if (form.discountEndDate)
          payload.discountEndDate = form.discountEndDate
      }
      if (form.minQuantityDiscount > 0 && form.quantityDiscountPercent > 0) {
        payload.minQuantityDiscount = form.minQuantityDiscount
        payload.quantityDiscountPercent = form.quantityDiscountPercent
      }

      if (isEditing) {
        await updateProduct(product!.id, payload)
        toast.success("Producto actualizado correctamente")
      } else {
        await createProduct(payload)
        toast.success("Producto creado correctamente")
      }

      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el producto")
    }
    setSaving(false)
  }

  // ─── Categorías filtradas por tipo de producto ────

  const relevantCategories =
    form.productType === "INSTRUMENT"
      ? instrumentCategories
      : accessoryCategories
  const otherCategories =
    form.productType === "INSTRUMENT"
      ? accessoryCategories
      : instrumentCategories

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-0 sm:max-w-5xl">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">
            {isEditing ? (
              <span className="line-clamp-2">
                Editar:{" "}
                <span className="font-normal text-gray-500">
                  {product?.name}
                </span>
              </span>
            ) : (
              "Nuevo producto"
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-6">
          {/* ═══════════════════════════════════════════════
              SECCIÓN 1: TIPO DE PRODUCTO
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Tipo de Producto</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TypeCard
                active={form.productType === "INSTRUMENT"}
                onClick={() => updateField("productType", "INSTRUMENT")}
                icon={<Drum className="h-5 w-5" />}
                title="Instrumento"
                description="Repique, Surdo, Tamborim, Caixa..."
                color="blue"
              />
              <TypeCard
                active={form.productType === "ACCESSORY"}
                onClick={() => updateField("productType", "ACCESSORY")}
                icon={<Wrench className="h-5 w-5" />}
                title="Accesorio"
                description="Parches, Baquetas, Correas, Fundas..."
                color="emerald"
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              SECCIÓN 2: CLASIFICACIÓN
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Clasificación</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Categoría */}
              <div>
                <Label className="mb-1.5 block text-sm">Categoría</Label>
                <Select
                  value={form.categoryId?.toString() || "0"}
                  onValueChange={(v) =>
                    updateField("categoryId", parseInt(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin categoría</SelectItem>
                    {relevantCategories.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>
                          {form.productType === "INSTRUMENT"
                            ? "Instrumentos"
                            : "Accesorios"}
                        </SelectLabel>
                        {relevantCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {otherCategories.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>
                          {form.productType === "INSTRUMENT"
                            ? "Accesorios"
                            : "Instrumentos"}
                        </SelectLabel>
                        {otherCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Registro sonoro (solo instrumentos) */}
              {form.productType === "INSTRUMENT" && (
                <div>
                  <Label className="mb-1.5 block text-sm">
                    Registro sonoro
                  </Label>
                  <Select
                    value={form.instrumentRegister || "none"}
                    onValueChange={(v) =>
                      updateField(
                        "instrumentRegister",
                        v === "none" ? "" : v
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar registro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      <SelectItem value="AGUDO">
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                          Agudo — Repique, Tamborim, Agogó
                        </span>
                      </SelectItem>
                      <SelectItem value="MEDIO">
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                          Medio — Caixa, Timbal
                        </span>
                      </SelectItem>
                      <SelectItem value="GRAVE">
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                          Grave — Surdo, Cuica
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* ═══════════════════════════════════════════════
              SECCIÓN 3: INFORMACIÓN DEL PRODUCTO
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Información del Producto</SectionTitle>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 block text-sm">Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="ej: Repique, Surdo, Parche..."
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    className="font-mono text-sm text-gray-500"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">SKU</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => updateField("sku", e.target.value)}
                    className="font-mono text-sm text-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-sm">
                  Descripción corta
                </Label>
                <Input
                  value={form.shortDescription}
                  onChange={(e) =>
                    updateField("shortDescription", e.target.value)
                  }
                  placeholder="Para tarjetas de producto (1 línea)"
                  maxLength={150}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {form.shortDescription.length}/150 caracteres
                </p>
              </div>

              <div>
                <Label className="mb-1.5 block text-sm">
                  Descripción completa *
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  rows={3}
                  placeholder="Descripción detallada del producto para la página de detalle"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══════════════════════════════════════════════
              SECCIÓN 4: IMÁGENES
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Imágenes</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-sm">
                  Imagen principal
                </Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="https://..."
                />
                {form.imageUrl && (
                  <div className="mt-2 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                )}
                {!form.imageUrl && (
                  <div className="mt-2 inline-flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">
                  Galería de imágenes
                </Label>
                <Textarea
                  value={form.images.join("\n")}
                  onChange={(e) =>
                    updateField(
                      "images",
                      e.target.value.split("\n").filter(Boolean)
                    )
                  }
                  rows={3}
                  placeholder="Una URL por línea"
                />
                {form.images.filter(Boolean).length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {form.images.filter(Boolean).length} imagen(es) en
                    galería
                  </p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══════════════════════════════════════════════
              SECCIÓN 5: VARIANTES
              ═══════════════════════════════════════════════ */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <SectionTitle className="mb-0">Variantes</SectionTitle>
              {variants.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs font-medium"
                >
                  {variants.length}
                </Badge>
              )}
            </div>
            <p className="mb-4 text-xs text-gray-500">
              Cada variante es una combinación comprable: marca + medida +
              modelo + material. Definí las variantes disponibles y sus
              precios/stock individuales.
            </p>
            <VariantManager
              variants={variants}
              setVariants={setVariants}
              brands={brands}
              productSku={form.sku}
            />
          </section>

          <Separator />

          {/* ═══════════════════════════════════════════════
              SECCIÓN 6: PRECIO Y STOCK BASE
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Precio y Stock Base</SectionTitle>
            <p className="mb-4 text-xs text-gray-500">
              Se usan como referencia o cuando el producto no tiene variantes
              con precio propio.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-sm">
                  Precio base (ARS)
                </Label>
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) =>
                    updateField("price", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">Stock base</Label>
                <Input
                  type="number"
                  value={form.stockQuantity || ""}
                  onChange={(e) =>
                    updateField(
                      "stockQuantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══════════════════════════════════════════════
              SECCIÓN 7: DESCUENTOS
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Descuentos</SectionTitle>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 block text-sm">
                    % Descuento
                  </Label>
                  <Input
                    type="number"
                    value={form.discountPercent || ""}
                    onChange={(e) =>
                      updateField(
                        "discountPercent",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">
                    Válido desde
                  </Label>
                  <Input
                    type="date"
                    value={form.discountStartDate}
                    onChange={(e) =>
                      updateField("discountStartDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">
                    Válido hasta
                  </Label>
                  <Input
                    type="date"
                    value={form.discountEndDate}
                    onChange={(e) =>
                      updateField("discountEndDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <p className="mb-3 text-xs font-medium text-gray-700">
                  Descuento por cantidad
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-500">
                      Cantidad mínima
                    </Label>
                    <Input
                      type="number"
                      value={form.minQuantityDiscount || ""}
                      onChange={(e) =>
                        updateField(
                          "minQuantityDiscount",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="ej: 2"
                      min={0}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-500">
                      % Descuento por cantidad
                    </Label>
                    <Input
                      type="number"
                      value={form.quantityDiscountPercent || ""}
                      onChange={(e) =>
                        updateField(
                          "quantityDiscountPercent",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══════════════════════════════════════════════
              SECCIÓN 8: CONFIGURACIÓN
              ═══════════════════════════════════════════════ */}
          <section>
            <SectionTitle>Configuración</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              <ToggleOption
                label="Producto activo"
                description="Visible en la tienda"
                checked={form.isActive}
                onChange={(v) => updateField("isActive", v)}
              />
              <ToggleOption
                label="Destacado"
                description="Aparece en la página principal"
                checked={form.isFeatured}
                onChange={(v) => updateField("isFeatured", v)}
              />
              <ToggleOption
                label="Requiere consulta"
                description="El cliente consulta disponibilidad por WhatsApp"
                checked={form.requiresAvailabilityCheck}
                onChange={(v) =>
                  updateField("requiresAvailabilityCheck", v)
                }
              />
            </div>
          </section>
        </div>

        {/* Footer fijo */}
        <DialogFooter className="sticky bottom-0 border-t bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400 sm:max-w-[60%]">
              {variants.length > 0 &&
                `${variants.length} variante${variants.length !== 1 ? "s" : ""} · `}
              {form.productType === "INSTRUMENT"
                ? "Instrumento"
                : "Accesorio"}
              {form.instrumentRegister &&
                ` · ${form.instrumentRegister.charAt(0) + form.instrumentRegister.slice(1).toLowerCase()}`}
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none"
              >
                {saving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Guardar cambios" : "Crear producto"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-componentes ────────────────────────────────

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3
      className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${className}`}
    >
      {children}
    </h3>
  )
}

function TypeCard({
  active,
  onClick,
  icon,
  title,
  description,
  color,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
  color: "blue" | "emerald"
}) {
  const colors = {
    blue: {
      active: "border-blue-500 bg-blue-50 shadow-sm",
      icon: "bg-blue-100 text-blue-600",
    },
    emerald: {
      active: "border-emerald-500 bg-emerald-50 shadow-sm",
      icon: "bg-emerald-100 text-emerald-600",
    },
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
        active
          ? colors[color].active
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div
        className={`rounded-lg p-2 ${active ? colors[color].icon : "bg-gray-100 text-gray-400"}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  )
}

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  )
}
