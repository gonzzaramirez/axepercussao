"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/category"
import type { Category } from "@/types"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")

  const loadData = useCallback(async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const openCreate = () => {
    setEditing(null)
    setName("")
    setSlug("")
    setDescription("")
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || "")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const categorySlug = slug.trim() || slugify(name)
      if (editing) {
        await updateCategory(editing.id, {
          name,
          slug: categorySlug,
          description: description || undefined,
        })
      } else {
        await createCategory({
          name,
          slug: categorySlug,
          description: description || undefined,
        })
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return
    try {
      await deleteCategory(id)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500">{categories.length} categorías</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nueva categoría
        </Button>
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
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-mono text-sm text-gray-500">#{cat.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{cat.name}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{cat.slug}</TableCell>
                  <TableCell className="text-sm text-gray-500">{cat.description || "—"}</TableCell>
                  <TableCell>{cat._count?.products ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    No hay categorías
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!editing) setSlug(slugify(e.target.value))
                }}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: repiques, parches"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
