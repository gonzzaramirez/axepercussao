"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Loader2, Globe2, ImageIcon } from "lucide-react"
import type { Brand } from "@/types"
import { getBrandsAdmin, createBrand, updateBrand } from "@/lib/api/brand"
import { useDashboardLayout } from "@/hooks/use-dashboard-layout"

export default function MarcasPage() {
  const { viewMode } = useDashboardLayout()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "active",
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [website, setWebsite] = useState("")
  const [notes, setNotes] = useState("")

  const loadData = useCallback(async () => {
    try {
      const data = await getBrandsAdmin()
      setBrands(data)
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    setLogoUrl("")
    setWebsite("")
    setNotes("")
    setDialogOpen(true)
  }

  const openEdit = (brand: Brand) => {
    setEditing(brand)
    setName(brand.name)
    setSlug(brand.slug)
    setLogoUrl(brand.logoUrl || "")
    setWebsite(brand.website || "")
    // notas opcionales: hoy no están en el modelo, pero podemos reutilizar website como referencia
    setNotes("")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const finalSlug = slug.trim() || slugify(name)

      if (editing) {
        await updateBrand(editing.id, {
          name,
          slug: finalSlug,
          logoUrl: logoUrl || undefined,
          website: website || undefined,
          // isActive se cambia desde la lista
        })
      } else {
        await createBrand({
          name,
          slug: finalSlug,
          logoUrl: logoUrl || undefined,
          website: website || undefined,
          isActive: true,
        })
      }

      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setSaving(false)
  }

  const handleToggleActive = async (brand: Brand) => {
    try {
      await updateBrand(brand.id, { isActive: !brand.isActive })
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredBrands = brands.filter((brand) => {
    if (statusFilter === "active" && brand.isActive === false) return false
    if (statusFilter === "inactive" && brand.isActive !== false) return false
    return true
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
          <p className="text-sm text-gray-500">
            {brands.length} marcas ·{" "}
            {brands.filter((b) => b.isActive !== false).length} activas ·{" "}
            {brands.filter((b) => b.isActive === false).length} inactivas
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nueva marca
        </Button>
      </div>

      <div className="mb-4">
        <Tabs
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as "all" | "active" | "inactive")
          }
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-[260px]">
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="inactive">Inactivas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-3">
          {filteredBrands.map((brand) => (
            <Card key={brand.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-gray-50">
                    {brand.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{brand.name}</p>
                        <p className="font-mono text-xs text-gray-500">
                          #{brand.id} · {brand.slug}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleActive(brand)}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          brand.isActive !== false
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {brand.isActive !== false ? "Activa" : "Inactiva"}
                      </button>
                    </div>
                    {brand.website && (
                      <p className="flex items-center gap-1 text-xs text-blue-600">
                        <Globe2 className="h-3 w-3" />
                        <span className="truncate">{brand.website}</span>
                      </p>
                    )}
                    <div className="pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(brand)}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBrands.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-gray-500">
                No hay marcas
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Sitio web</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-mono text-sm text-gray-500">
                    #{brand.id}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {brand.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {brand.slug}
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {brand.logoUrl ? (
                      <span className="truncate text-xs text-blue-600">
                        {brand.logoUrl}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    {brand.website ? (
                      <span className="truncate text-xs text-blue-600">
                        {brand.website}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(brand)}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        brand.isActive !== false
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {brand.isActive !== false ? "Activa" : "Inactiva"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(brand)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBrands.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-gray-500"
                  >
                    No hay marcas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar marca" : "Nueva marca"}
            </DialogTitle>
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
                placeholder="ej: gope, ivsom"
              />
            </div>
            <div>
              <Label>Logo (URL)</Label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Sitio web</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Notas internas (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Información extra para tu referencia interna"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full sm:w-auto"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

