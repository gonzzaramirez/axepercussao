import type { Brand } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Genera slug desde nombre (minúsculas, sin acentos, guiones) */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ─── Públicas (catálogo, filtros) ────────────────────────────

export async function getBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_URL}/brands`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error("Error obteniendo marcas")
  return res.json()
}

// ─── Admin (dashboard) ───────────────────────────────────────

export async function getBrandsAdmin(): Promise<Brand[]> {
  const res = await fetch(`${API_URL}/brands/admin/all`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error obteniendo marcas (admin)")
  return res.json()
}

export async function createBrand(data: {
  name: string
  slug?: string
  logoUrl?: string
  website?: string
  isActive?: boolean
}): Promise<Brand> {
  const slug = data.slug || slugify(data.name)
  const res = await fetch(`${API_URL}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...data, slug }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error creando marca")
  }
  return res.json()
}

export async function updateBrand(
  id: number,
  data: { name?: string; slug?: string; logoUrl?: string; website?: string; isActive?: boolean },
): Promise<Brand> {
  const res = await fetch(`${API_URL}/brands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error actualizando marca")
  }
  return res.json()
}

