"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrderStats } from "@/lib/api/order"
import type { OrderStats } from "@/types"
import { Package, ShoppingBag, Truck, DollarSign, Clock, XCircle } from "lucide-react"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      title: "Pedidos totales",
      value: stats?.total ?? 0,
      icon: ShoppingBag,
      color: "text-gray-900",
    },
    {
      title: "Pendientes",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Confirmados",
      value: stats?.confirmed ?? 0,
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Enviados",
      value: stats?.shipped ?? 0,
      icon: Truck,
      color: "text-blue-600",
    },
    {
      title: "Cancelados",
      value: stats?.cancelled ?? 0,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Ingresos",
      value: stats ? formatPrice(stats.revenue) : "$0",
      icon: DollarSign,
      color: "text-green-700",
      isRevenue: true,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumen general de tu tienda</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="mt-2 h-8 w-16 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
