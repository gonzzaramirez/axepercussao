"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  getOrders,
  updateOrderStatus,
  updateOrderTracking,
} from "@/lib/api/order"
import type { Order } from "@/types"
import { Loader2, Eye, CheckCircle, Truck, XCircle } from "lucide-react"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(price)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmado", color: "bg-green-100 text-green-800" },
  SHIPPED: { label: "Enviado", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingDialog, setTrackingDialog] = useState(false)
  const [trackingCode, setTrackingCode] = useState("")
  const [courierName, setCourierName] = useState("")
  const [trackingOrderId, setTrackingOrderId] = useState("")
  const [actionLoading, setActionLoading] = useState("")

  const loadData = useCallback(async () => {
    try {
      const status = tab === "all" ? undefined : tab
      const data = await getOrders(status)
      setOrders(data)
    } catch { /* */ }
    setLoading(false)
  }, [tab])

  useEffect(() => { setLoading(true); loadData() }, [loadData])

  const handleConfirm = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      await updateOrderStatus(orderId, { status: "CONFIRMED" })
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setActionLoading("")
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm("¿Cancelar este pedido?")) return
    setActionLoading(orderId)
    try {
      await updateOrderStatus(orderId, { status: "CANCELLED" })
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setActionLoading("")
  }

  const openTracking = (orderId: string) => {
    setTrackingOrderId(orderId)
    setTrackingCode("")
    setCourierName("")
    setTrackingDialog(true)
  }

  const handleSendTracking = async () => {
    if (!trackingCode.trim()) return
    setActionLoading(trackingOrderId)
    try {
      await updateOrderTracking(trackingOrderId, {
        trackingCode,
        courierName: courierName || undefined,
      })
      setTrackingDialog(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    }
    setActionLoading("")
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500">{orders.length} pedidos</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="PENDING">Pendientes</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmados</TabsTrigger>
          <TabsTrigger value="SHIPPED">Enviados</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelados</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDING
                const isLoading = actionLoading === order.id
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {order.guestCustomer ? (
                        <div>
                          <p className="text-sm font-medium">{order.guestCustomer.firstName} {order.guestCustomer.lastName}</p>
                          <p className="text-xs text-gray-500">{order.guestCustomer.email}</p>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{order.items?.length ?? 0}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} border-transparent`}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)} title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "PENDING" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleConfirm(order.id)} disabled={isLoading} title="Confirmar pago" className="text-green-600 hover:text-green-700">
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(order.id)} disabled={isLoading} title="Cancelar" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button variant="ghost" size="icon" onClick={() => openTracking(order.id)} title="Agregar tracking" className="text-blue-600 hover:text-blue-700">
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">No hay pedidos</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog detalle */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              {selectedOrder.guestCustomer && (
                <div>
                  <p className="font-semibold text-gray-900">Cliente</p>
                  <p>{selectedOrder.guestCustomer.firstName} {selectedOrder.guestCustomer.lastName}</p>
                  <p className="text-gray-500">{selectedOrder.guestCustomer.email} | {selectedOrder.guestCustomer.phone}</p>
                  <p className="text-gray-500">DNI: {selectedOrder.guestCustomer.dni}</p>
                  <p className="text-gray-500">
                    {selectedOrder.guestCustomer.street}
                    {selectedOrder.guestCustomer.apartment ? `, ${selectedOrder.guestCustomer.apartment}` : ""}
                    , {selectedOrder.guestCustomer.city}, {selectedOrder.guestCustomer.province}
                  </p>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">Productos</p>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.quantity}x {item.productName}{item.brandName ? ` (${item.brandName})` : ""}{item.variantDesc ? ` - ${item.variantDesc}` : ""}</span>
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
              {selectedOrder.customerNotes && (
                <div>
                  <p className="font-semibold text-gray-900">Notas del cliente</p>
                  <p className="text-gray-600">{selectedOrder.customerNotes}</p>
                </div>
              )}
              {selectedOrder.trackingCode && (
                <div>
                  <p className="font-semibold text-gray-900">Tracking</p>
                  <p>{selectedOrder.trackingCode} {selectedOrder.courierName ? `(${selectedOrder.courierName})` : ""}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog tracking */}
      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar código de seguimiento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Código de tracking *</Label>
              <Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} />
            </div>
            <div>
              <Label>Empresa de transporte</Label>
              <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Ej: DAC, UES, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialog(false)}>Cancelar</Button>
            <Button onClick={handleSendTracking} disabled={!trackingCode.trim() || actionLoading === trackingOrderId}>
              {actionLoading === trackingOrderId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
