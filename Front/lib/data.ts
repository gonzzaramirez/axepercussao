import type { Product, Category, Brand } from "@/types"

export const products: Product[] = [
  {
    id: "1",
    slug: "repique-12-gope",
    name: 'Repique 12" Gope',
    description:
      "Repique de aluminio 12 pulgadas con herrajes cromados. Sonido brillante y penetrante, ideal para breaks y repicadas.",
    category: "repique",
    brand: "Gope",
    price: 185000,
    image: "/placeholder.svg",
    featured: true,
  },
  {
    id: "2",
    slug: "surdo-18-contemporanea",
    name: 'Surdo 18" Contemporânea',
    description:
      "Surdo de primeira 18 pulgadas con casco de aluminio. Tono profundo y envolvente para marcar el pulso de la batería.",
    category: "surdo",
    brand: "Contemporanea",
    price: 320000,
    image: "/placeholder.svg",
    featured: true,
  },
  {
    id: "3",
    slug: "tamborim-ivsom",
    name: "Tamborim IVSOM",
    description:
      "Tamborim profesional con aro de nailon y parche de plástico. Ataque definido y cortante para swings y telecoteco.",
    category: "tamborim",
    brand: "Ivsom",
    price: 45000,
    image: "/placeholder.svg",
    featured: true,
  },
  {
    id: "4",
    slug: "chocalho-redencao-gope",
    name: "Chocalho Redenção Gope",
    description:
      "Chocalho de 5 platillos en aluminio. Sonido metálico y cristalino, esencial para el groove del samba.",
    category: "chocalho",
    brand: "Gope",
    price: 78000,
    image: "/placeholder.svg",
  },
  {
    id: "5",
    slug: "surdo-20-gope",
    name: 'Surdo 20" Gope',
    description:
      "Surdo de segunda 20 pulgadas. Casco en aluminio pulido con afinación precisa. El corazón rítmico de toda batería.",
    category: "surdo",
    brand: "Gope",
    price: 350000,
    image: "/placeholder.svg",
    featured: true,
  },
  {
    id: "6",
    slug: "baquetas-repique-contemporanea",
    name: "Baquetas de Repique Contemporânea",
    description:
      "Par de baquetas de nailon flexibles diseñadas para repique. Durabilidad y respuesta rápida en cada golpe.",
    category: "accesorio",
    brand: "Contemporanea",
    price: 25000,
    image: "/placeholder.svg",
  },
  {
    id: "7",
    slug: "repique-10-ivsom",
    name: 'Repique 10" IVSOM',
    description:
      "Repique compacto 10 pulgadas en aluminio liviano. Perfecto para ritmistas que buscan portabilidad sin sacrificar potencia.",
    category: "repique",
    brand: "Ivsom",
    price: 155000,
    image: "/placeholder.svg",
  },
  {
    id: "8",
    slug: "talabarte-gope-pro",
    name: "Talabarte Gope Pro",
    description:
      "Talabarte profesional acolchado con enganche rápido. Distribución ergonómica del peso para horas de carnaval.",
    category: "accesorio",
    brand: "Gope",
    price: 32000,
    image: "/placeholder.svg",
  },
]

export const categories: { value: Category; label: string }[] = [
  { value: "surdo", label: "Surdos" },
  { value: "repique", label: "Repiques" },
  { value: "tamborim", label: "Tamborins" },
  { value: "chocalho", label: "Chocalhos" },
  { value: "accesorio", label: "Accesorios" },
]

export const brands: { value: Brand; label: string }[] = [
  { value: "Gope", label: "Gope" },
  { value: "Ivsom", label: "IVSOM" },
  { value: "Contemporanea", label: "Contemporânea" },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getCategoryLabel(category: Category): string {
  return categories.find((c) => c.value === category)?.label ?? category
}
