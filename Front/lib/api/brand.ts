import type { Brand } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_URL}/brands`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error("Error obteniendo marcas")
  return res.json()
}
