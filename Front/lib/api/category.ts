import type { Category } from "@/types"

import { API_URL } from "@/lib/api/config"

/** Genera slug desde nombre (minúsculas, sin acentos, guiones) */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Error obteniendo categorías")
  return res.json()
}

export async function getCategoryById(id: number): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Categoría no encontrada")
  return res.json()
}

export async function createCategory(data: {
  name: string
  slug?: string
  description?: string
}): Promise<Category> {
  const slug = data.slug || slugify(data.name)
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...data, slug }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error creando categoría")
  }
  return res.json()
}

export async function updateCategory(
  id: number,
  data: { name?: string; slug?: string; description?: string; isActive?: boolean }
): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Error actualizando categoría")
  }
  return res.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Error eliminando categoría")
}
