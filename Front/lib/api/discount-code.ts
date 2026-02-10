import type { DiscountCode, ValidateDiscountCodeResponse } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ─── Función PÚBLICA ────────────────────────────────

export async function validateDiscountCode(
  code: string,
  orderAmount?: number
): Promise<ValidateDiscountCodeResponse> {
  const res = await fetch(`${API_URL}/discount-codes/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, orderAmount }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Código no válido")
  }
  return res.json()
}

// ─── Funciones ADMIN ────────────────────────────────

export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const res = await fetch(`${API_URL}/discount-codes`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error obteniendo códigos")
  return res.json()
}

export async function createDiscountCode(data: {
  code: string
  description?: string
  discountPercent: number
  isActive?: boolean
  validFrom?: string
  validUntil?: string
  usageLimit?: number
  minOrderAmount?: number
}): Promise<DiscountCode> {
  const res = await fetch(`${API_URL}/discount-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error creando código")
  }
  return res.json()
}

export async function updateDiscountCode(
  id: string,
  data: Partial<DiscountCode>
): Promise<DiscountCode> {
  const res = await fetch(`${API_URL}/discount-codes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error actualizando código")
  }
  return res.json()
}

export async function deleteDiscountCode(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/discount-codes/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error eliminando código")
}
