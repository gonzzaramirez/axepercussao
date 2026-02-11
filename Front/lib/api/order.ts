import type { Order, CreateOrderDto, OrderStats } from "@/types"

import { API_URL } from "@/lib/api/config"

// ─── Funciones PÚBLICAS ─────────────────────────────

export async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error creando pedido")
  }
  return res.json()
}

export async function trackOrder(id: string): Promise<Order | null> {
  try {
    const res = await fetch(`${API_URL}/orders/track/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ─── Funciones ADMIN ────────────────────────────────

export async function getOrders(status?: string): Promise<Order[]> {
  const params = status ? `?status=${status}` : ""
  const res = await fetch(`${API_URL}/orders${params}`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error obteniendo pedidos")
  return res.json()
}

export async function getOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Pedido no encontrado")
  return res.json()
}

export async function getOrderStats(): Promise<OrderStats> {
  const res = await fetch(`${API_URL}/orders/stats`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error obteniendo estadísticas")
  return res.json()
}

export async function updateOrderStatus(
  id: string,
  data: { status: string; adminNotes?: string }
): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error actualizando estado")
  }
  return res.json()
}

export async function updateOrderTracking(
  id: string,
  data: { trackingCode: string; courierName?: string }
): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/tracking`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error actualizando tracking")
  }
  return res.json()
}
