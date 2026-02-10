"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { bulkPriceUpdate } from "@/lib/api/product"
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

export default function PreciosPage() {
  const [percentChange, setPercentChange] = useState(0)
  const [reason, setReason] = useState("")
  const [productType, setProductType] = useState("all")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (percentChange === 0) return

    const action = percentChange > 0 ? "aumentar" : "reducir"
    if (!confirm(`¿Estás seguro de ${action} los precios un ${Math.abs(percentChange)}%?`)) return

    setLoading(true)
    setResult(null)

    try {
      const data: any = {
        percentChange,
        reason: reason || undefined,
      }
      if (productType !== "all") {
        data.productType = productType
      }

      const res = await bulkPriceUpdate(data)
      setResult(`${res.count} productos actualizados exitosamente`)
      setPercentChange(0)
      setReason("")
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Actualización de precios</h1>
        <p className="text-sm text-gray-500">Actualizar precios masivamente por porcentaje</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actualización masiva</CardTitle>
            <CardDescription>
              Aplicá un porcentaje de cambio a todos los productos o filtrados por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Porcentaje de cambio *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={percentChange}
                    onChange={(e) => setPercentChange(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Positivo para aumentar, negativo para reducir
                </p>
              </div>

              <div>
                <Label>Tipo de producto</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los productos</SelectItem>
                    <SelectItem value="PERCUSSION">Solo Percusión</SelectItem>
                    <SelectItem value="ACCESSORY">Solo Accesorios</SelectItem>
                    <SelectItem value="SPARE_PART">Solo Repuestos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Motivo (opcional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Ajuste por inflación febrero 2026"
                  rows={2}
                />
              </div>

              {result && (
                <div className={`rounded-lg p-3 text-sm ${result.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {result}
                </div>
              )}

              <Button type="submit" disabled={loading || percentChange === 0} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : percentChange > 0 ? (
                  <TrendingUp className="mr-2 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-2 h-4 w-4" />
                )}
                Aplicar cambio de {percentChange > 0 ? "+" : ""}{percentChange}%
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="mb-2 font-semibold">Información importante</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Esta acción afecta a todos los productos que coincidan con el filtro</li>
                  <li>Los cambios se registran en el historial de precios</li>
                  <li>Los precios se redondean al entero más cercano</li>
                  <li>Los pedidos existentes no se ven afectados (precios congelados)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
