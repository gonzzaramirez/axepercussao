"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
} from "@/lib/api/discount-code"
import type { DiscountCode } from "@/types"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

export default function DescuentosPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DiscountCode | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountPercent: 10,
    isActive: true,
    validFrom: "",
    validUntil: "",
    usageLimit: 0,
    minOrderAmount: 0,
  })

  const loadData = useCallback(async () => {
    try { setCodes(await getDiscountCodes()) } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setEditing(null)
    setForm({ code: "", description: "", discountPercent: 10, isActive: true, validFrom: "", validUntil: "", usageLimit: 0, minOrderAmount: 0 })
    setDialogOpen(true)
  }

  const openEdit = (code: DiscountCode) => {
    setEditing(code)
    setForm({
      code: code.code,
      description: code.description || "",
      discountPercent: code.discountPercent,
      isActive: code.isActive,
      validFrom: code.validFrom ? code.validFrom.split("T")[0] : "",
      validUntil: code.validUntil ? code.validUntil.split("T")[0] : "",
      usageLimit: code.usageLimit ?? 0,
      minOrderAmount: code.minOrderAmount ?? 0,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data: any = {
        code: form.code,
        description: form.description || undefined,
        discountPercent: form.discountPercent,
        isActive: form.isActive,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        usageLimit: form.usageLimit || undefined,
        minOrderAmount: form.minOrderAmount || undefined,
      }
      if (editing) {
        await updateDiscountCode(editing.id, data)
      } else {
        await createDiscountCode(data)
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este código?")) return
    try { await deleteDiscountCode(id); loadData() } catch (err: any) { alert(err.message) }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Códigos de descuento</h1>
          <p className="text-sm text-gray-500">{codes.length} códigos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo código
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
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-bold">{code.code}</TableCell>
                  <TableCell className="text-green-700 font-semibold">-{code.discountPercent}%</TableCell>
                  <TableCell>
                    {code.usageCount}{code.usageLimit ? ` / ${code.usageLimit}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge className={code.isActive ? "bg-green-100 text-green-800 border-transparent" : "bg-gray-100 text-gray-600 border-transparent"}>
                      {code.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {code.validFrom || code.validUntil
                      ? `${code.validFrom ? new Date(code.validFrom).toLocaleDateString("es-AR") : "∞"} - ${code.validUntil ? new Date(code.validUntil).toLocaleDateString("es-AR") : "∞"}`
                      : "Sin límite"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(code)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(code.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">No hay códigos</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar código" : "Nuevo código"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Código *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DESCUENTO10" />
              </div>
              <div>
                <Label>% Descuento *</Label>
                <Input type="number" min={1} max={100} value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Válido desde</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              </div>
              <div>
                <Label>Válido hasta</Label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
              </div>
              <div>
                <Label>Límite de usos (0 = sin límite)</Label>
                <Input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Monto mínimo de orden (0 = sin mínimo)</Label>
                <Input type="number" min={0} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.code.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
