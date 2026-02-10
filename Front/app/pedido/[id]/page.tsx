import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { trackOrder } from "@/lib/api/order"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, Clock, CheckCircle, XCircle, Home } from "lucide-react"

interface PedidoPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PedidoPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Pedido #${id.slice(0, 8).toUpperCase()}`,
    robots: { index: false, follow: false },
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Confirmado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  SHIPPED: { label: "Enviado", color: "bg-blue-100 text-blue-800", icon: Truck },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { id } = await params
  const order = await trackOrder(id)

  if (!order) {
    notFound()
  }

  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen bg-secondary/20 pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-carnival-primary/10">
              <Package className="h-8 w-8 text-carnival-primary" />
            </div>
            <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              PEDIDO #{id.slice(0, 8).toUpperCase()}
            </h1>
            <div className="mt-3">
              <Badge className={`${status.color} border-transparent px-3 py-1 text-sm font-semibold`}>
                <StatusIcon className="mr-1.5 h-4 w-4" />
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Timeline */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className={`text-center ${order.status !== "CANCELLED" ? "text-carnival-primary" : "text-muted-foreground"}`}>
                  <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full ${order.status !== "CANCELLED" ? "bg-carnival-primary text-white" : "bg-muted"}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <span>Recibido</span>
                </div>
                <div className="h-px flex-1 mx-2 bg-border" />
                <div className={`text-center ${["CONFIRMED", "SHIPPED"].includes(order.status) ? "text-carnival-primary" : "text-muted-foreground"}`}>
                  <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full ${["CONFIRMED", "SHIPPED"].includes(order.status) ? "bg-carnival-primary text-white" : "bg-muted"}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span>Confirmado</span>
                </div>
                <div className="h-px flex-1 mx-2 bg-border" />
                <div className={`text-center ${order.status === "SHIPPED" ? "text-carnival-primary" : "text-muted-foreground"}`}>
                  <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full ${order.status === "SHIPPED" ? "bg-carnival-primary text-white" : "bg-muted"}`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <span>Enviado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          {order.trackingCode && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <p className="mb-1 text-sm text-blue-600">Código de seguimiento</p>
                <p className="text-2xl font-bold tracking-widest text-blue-800">
                  {order.trackingCode}
                </p>
                {order.courierName && (
                  <p className="mt-1 text-sm text-blue-600">
                    Transporte: {order.courierName}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-foreground">
                        {item.quantity}x {item.productName}
                      </span>
                      {item.brandName && (
                        <span className="text-muted-foreground"> ({item.brandName})</span>
                      )}
                      {item.variantDesc && (
                        <span className="text-muted-foreground"> - {item.variantDesc}</span>
                      )}
                    </div>
                    <span className="font-semibold text-foreground">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-display text-2xl text-carnival-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Datos del cliente */}
          {order.customer && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-foreground">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.city}, {order.customer.province}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
