import type { Product } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Mapea la respuesta del API al formato que usa la UI */
function mapProduct(raw: any): Product {
  return {
    ...raw,
    price: raw.price ?? 0,
    image: raw.imageUrl || "/placeholder.svg",
    featured: raw.isFeatured ?? false,
    variants: raw.variants ?? [],
  }
}

// ─── Funciones PÚBLICAS ─────────────────────────────

export async function getProducts(options?: {
  featured?: boolean
  type?: string
  categoryId?: number
  search?: string
  register?: string
  /** Si true, incluye productos inactivos y usa credentials (para admin) */
  admin?: boolean
}): Promise<Product[]> {
  const params = new URLSearchParams()
  if (options?.featured) params.set("featured", "true")
  if (options?.type) params.set("type", options.type)
  if (options?.categoryId) params.set("categoryId", options.categoryId.toString())
  if (options?.search) params.set("search", options.search)
  if (options?.register) params.set("register", options.register)
  if (options?.admin) {
    params.set("active", "false")
    params.set("admin", "true")
  }

  const fetchOptions: RequestInit = options?.admin
    ? { credentials: "include" }
    : { next: { revalidate: 60 } as any }

  const res = await fetch(`${API_URL}/products?${params}`, fetchOptions)

  if (!res.ok) throw new Error("Error obteniendo productos")
  const data = await res.json()
  return data.map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    return mapProduct(data)
  } catch {
    return null
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return mapProduct(data)
  } catch {
    return null
  }
}

// ─── Funciones ADMIN (con credentials) ──────────────

export async function createProduct(data: any): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error creando producto")
  }
  return mapProduct(await res.json())
}

export async function updateProduct(id: string, data: any): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error actualizando producto")
  }
  return mapProduct(await res.json())
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error eliminando producto")
}

export async function restoreProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error restaurando producto")
}

export async function getDeletedProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products/admin/deleted`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error obteniendo productos eliminados")
  const data = await res.json()
  return data.map(mapProduct)
}

export async function bulkPriceUpdate(data: {
  percentChange: number
  reason?: string
  productType?: string
  productIds?: string[]
}): Promise<{ message: string; count: number }> {
  const res = await fetch(`${API_URL}/products/bulk-price-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error actualizando precios")
  return res.json()
}

export async function getPriceHistory(productId: string) {
  const res = await fetch(`${API_URL}/products/${productId}/price-history`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error obteniendo historial")
  return res.json()
}
