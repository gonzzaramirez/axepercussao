"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getProducts, updateProduct } from "@/lib/api/product"
import { getCategories } from "@/lib/api/category"
import { getBrands } from "@/lib/api/brand"
import type { Product, Category, Brand } from "@/types"
import {
  Plus,
  Search,
  Loader2,
  Package,
  Wrench,
  Layers,
} from "lucide-react"
import { ProductFormDialog } from "./components/product-form-dialog"
import { ProductsDataCard } from "./components/data-card"
import { ProductsDataTable } from "./components/data-table"
import { toast } from "sonner"
import { useDashboardLayout } from "@/hooks/use-dashboard-layout"

// ─── Helpers ────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

// ─── Página ─────────────────────────────────────────

export default function ProductosPage() {
  const { viewMode } = useDashboardLayout()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "active",
  )

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ─── Carga de datos ────

  const loadData = useCallback(async () => {
    try {
      const [prods, cats, brnds] = await Promise.all([
        getProducts({ admin: true }),
        getCategories(),
        getBrands(),
      ])
      setProducts(prods)
      setCategories(cats)
      setBrands(brnds)
    } catch (err) {
      console.error("Error cargando datos:", err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Filtrado ────

  const filteredProducts = products.filter((p) => {
    // Filtro por tipo
    if (typeFilter === "INSTRUMENT" && p.productType !== "INSTRUMENT")
      return false
    if (typeFilter === "ACCESSORY" && p.productType !== "ACCESSORY")
      return false

    // Filtro por categoría
    if (
      categoryFilter !== "all" &&
      p.categoryId?.toString() !== categoryFilter
    )
      return false

    // Filtro por búsqueda
    if (search) {
      const q = search.toLowerCase()
      if (
        !(
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
        )
      ) {
        return false
      }
    }

    // Filtro por estado (activo / inactivo)
    if (statusFilter === "active" && p.isActive === false) return false
    if (statusFilter === "inactive" && p.isActive !== false) return false

    return true
  })

  // ─── Stats rápidos ────

  const stats = {
    total: products.length,
    instruments: products.filter((p) => p.productType === "INSTRUMENT").length,
    accessories: products.filter((p) => p.productType === "ACCESSORY").length,
    totalVariants: products.reduce(
      (sum, p) => sum + (p.variants?.length || 0),
      0
    ),
  }

  // ─── Acciones ────

  const openCreate = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await updateProduct(deleteTarget.id, { isActive: false })
      toast.success(`"${deleteTarget.name}" dado de baja`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Error dando de baja el producto")
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const handleRestore = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: true })
      toast.success(`"${product.name}" reactivado`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Error reactivando producto")
    }
  }

  // ─── Categorías filtradas según el tab activo ────

  const filteredCategories =
    typeFilter === "all"
      ? categories
      : categories.filter((c) => {
          // Usar los productos existentes para determinar qué categorías mostrar
          return products.some(
            (p) =>
              p.categoryId === c.id && p.productType === typeFilter
          )
        })

  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              {stats.total} productos
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              {stats.instruments} instrumentos
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              {stats.accessories} accesorios
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              {stats.totalVariants} variantes
            </span>
          </div>
        </div>
        <Button onClick={openCreate} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* ═══ Filtros ═══ */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="grid w-full grid-cols-3 sm:w-fit">
              <TabsTrigger value="all">
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="INSTRUMENT">
                <Package className="mr-1.5 h-3.5 w-3.5" />
                Instrumentos
              </TabsTrigger>
              <TabsTrigger value="ACCESSORY">
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                Accesorios
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-[260px]">
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="inactive">Inactivos</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* ═══ Vista responsive ═══ */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {viewMode === "table" ? (
            <ProductsDataTable
              products={filteredProducts}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onRestore={handleRestore}
              formatPrice={formatPrice}
              search={search}
            />
          ) : (
            <ProductsDataCard
              products={filteredProducts}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onRestore={handleRestore}
              formatPrice={formatPrice}
              search={search}
            />
          )}
        </>
      )}

      {/* ═══ Diálogo de crear/editar producto ═══ */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onSaved={loadData}
      />

      {/* ═══ Confirmación de eliminación ═══ */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja el producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se marcará como inactivo{" "}
              <span className="font-medium text-gray-900">
                &quot;{deleteTarget?.name}&quot;
              </span>{" "}
              y dejará de mostrarse como producto activo. Podés
              reactivarlo editando el producto y marcándolo como activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
