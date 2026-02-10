"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api/product"
import { getCategories } from "@/lib/api/category"
import type { Product, Category } from "@/types"
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price)
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: "", slug: "", sku: "", description: "", price: 0,
    stockQuantity: 0, imageUrl: "", isActive: true, isFeatured: false,
    categoryId: 0, productType: "INSTRUMENT" as string,
  })

  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProducts({ search: search || undefined }),
        getCategories(),
      ])
      setProducts(prods)
      setCategories(cats)
    } catch { /* fallback */ }
    setLoading(false)
  }, [search])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", slug: "", sku: "", description: "", price: 0, stockQuantity: 0, imageUrl: "", isActive: true, isFeatured: false, categoryId: 0, productType: "INSTRUMENT" })
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name, slug: product.slug, sku: product.sku || "",
      description: product.description, price: product.price,
      stockQuantity: product.stockQuantity ?? 0,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      categoryId: product.categoryId ?? 0,
      productType: product.productType || "INSTRUMENT",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        ...form,
        categoryId: form.categoryId || undefined,
        imageUrl: form.imageUrl || undefined,
      }
      if (editing) {
        await updateProduct(editing.id, data)
      } else {
        await createProduct(data)
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return
    try {
      await deleteProduct(id)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">{products.length} productos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name || product.productType}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{product.sku}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stockQuantity ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{product.productType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={product.isActive ? "bg-green-100 text-green-800 border-transparent" : "bg-gray-100 text-gray-600 border-transparent"}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    No hay productos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) }) }} />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>SKU *</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div>
                <Label>Precio *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Tipo de producto</Label>
                <Select value={form.productType} onValueChange={(v) => setForm({ ...form, productType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTRUMENT">Instrumento</SelectItem>
                    <SelectItem value="ACCESSORY">Accesorio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoryId?.toString() || "0"} onValueChange={(v) => setForm({ ...form, categoryId: parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin categoría</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL de imagen</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label>Descripción *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label>Activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <Label>Destacado</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
