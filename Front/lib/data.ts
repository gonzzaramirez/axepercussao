// Datos mock para cuando el API no está disponible
export const products: any[] = [
  {
    id: "1",
    slug: "repique",
    name: "Repique",
    description:
      "Repique de aluminio con herrajes cromados. Sonido brillante y penetrante, ideal para breaks y repicadas en la batería.",
    price: 185000,
    image: "/placeholder.svg",
    featured: true,
    productType: "INSTRUMENT",
    instrumentRegister: "AGUDO",
    category: { id: 1, name: "Agudos", slug: "agudos" },
    variants: [
      { id: "v1", sku: "REP-GOPE-12", size: '12"', brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 5, isActive: true },
      { id: "v2", sku: "REP-GOPE-14", size: '14"', brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 3, isActive: true },
      { id: "v3", sku: "REP-IVSOM-12", size: '12"', brand: { id: 2, name: "IVSOM", slug: "ivsom" }, stockQuantity: 4, isActive: true },
      { id: "v4", sku: "REP-IVSOM-14", size: '14"', brand: { id: 2, name: "IVSOM", slug: "ivsom" }, stockQuantity: 2, isActive: true },
    ],
  },
  {
    id: "2",
    slug: "surdo",
    name: "Surdo",
    description:
      "Surdo con casco de aluminio pulido. Tono profundo y envolvente para marcar el pulso de la batería.",
    price: 320000,
    image: "/placeholder.svg",
    featured: true,
    productType: "INSTRUMENT",
    instrumentRegister: "GRAVE",
    category: { id: 3, name: "Graves", slug: "graves" },
    variants: [
      { id: "v5", sku: "SUR-GOPE-18", size: '18"', brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 2, isActive: true },
      { id: "v6", sku: "SUR-GOPE-22", size: '22"', brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 1, isActive: true },
      { id: "v7", sku: "SUR-CONT-18", size: '18"', brand: { id: 3, name: "Contemporânea", slug: "contemporanea" }, stockQuantity: 3, isActive: true },
    ],
  },
  {
    id: "3",
    slug: "tamborim",
    name: "Tamborim",
    description:
      "Tamborim profesional con aro de nailon y parche de plástico. Ataque definido y cortante para swings y telecoteco.",
    price: 45000,
    image: "/placeholder.svg",
    featured: true,
    productType: "INSTRUMENT",
    instrumentRegister: "AGUDO",
    category: { id: 1, name: "Agudos", slug: "agudos" },
    variants: [
      { id: "v8", sku: "TAM-IVSOM", brand: { id: 2, name: "IVSOM", slug: "ivsom" }, stockQuantity: 8, isActive: true },
      { id: "v9", sku: "TAM-GOPE", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 5, isActive: true },
    ],
  },
  {
    id: "4",
    slug: "agogo",
    name: "Agogó",
    description:
      "Agogó en aluminio cromado. Sonido metálico y definido, esencial para el groove del samba.",
    price: 78000,
    image: "/placeholder.svg",
    featured: true,
    productType: "INSTRUMENT",
    instrumentRegister: "AGUDO",
    category: { id: 1, name: "Agudos", slug: "agudos" },
    variants: [
      { id: "v10", sku: "AGO-GOPE-2B", model: "2 bocas", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 4, isActive: true },
      { id: "v11", sku: "AGO-GOPE-4B", model: "4 bocas", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 2, isActive: true },
    ],
  },
  {
    id: "5",
    slug: "caixa",
    name: "Caixa",
    description:
      "Caixa de guerra con casco de aluminio. Respuesta seca y cortante para la línea rítmica de la batería.",
    price: 195000,
    image: "/placeholder.svg",
    productType: "INSTRUMENT",
    instrumentRegister: "MEDIO",
    category: { id: 2, name: "Medios", slug: "medios" },
    variants: [
      { id: "v12", sku: "CAI-GOPE-CC", model: "Con caja", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 3, isActive: true },
      { id: "v13", sku: "CAI-GOPE-VA", model: "Vazada", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 2, isActive: true },
    ],
  },
  {
    id: "6",
    slug: "palillos",
    name: "Palillos",
    description:
      "Palillos de nailon para caixa y repique. Durabilidad y respuesta rápida en cada golpe.",
    price: 15000,
    image: "/placeholder.svg",
    productType: "ACCESSORY",
    category: { id: 6, name: "Baquetas y Palillos", slug: "baquetas-y-palillos" },
    variants: [
      { id: "v14", sku: "PAL-GOPE", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 20, isActive: true },
      { id: "v15", sku: "PAL-IVSOM", brand: { id: 2, name: "IVSOM", slug: "ivsom" }, stockQuantity: 15, isActive: true },
    ],
  },
  {
    id: "7",
    slug: "parche-plastico",
    name: "Parche de Plástico",
    description:
      "Parche de plástico resistente para instrumentos de percusión. Disponible en todas las medidas.",
    price: 12000,
    image: "/placeholder.svg",
    productType: "ACCESSORY",
    category: { id: 5, name: "Parches", slug: "parches" },
    variants: [
      { id: "v16", sku: "PAR-PL-GOPE-12", size: '12"', material: "Plástico", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 10, isActive: true },
      { id: "v17", sku: "PAR-PL-GOPE-14", size: '14"', material: "Plástico", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 8, isActive: true },
    ],
  },
  {
    id: "8",
    slug: "correa",
    name: "Correa",
    description:
      "Correa profesional con enganche seguro. Distribución ergonómica del peso para horas de carnaval.",
    price: 25000,
    image: "/placeholder.svg",
    productType: "ACCESSORY",
    category: { id: 7, name: "Correas", slug: "correas" },
    variants: [
      { id: "v18", sku: "COR-GOPE-SIM", model: "Simple", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 10, isActive: true },
      { id: "v19", sku: "COR-GOPE-ACO", model: "Acolchonada", brand: { id: 1, name: "Gope", slug: "gope" }, stockQuantity: 6, isActive: true },
    ],
  },
]

export const categoryFilters: { value: string; label: string }[] = [
  { value: "agudos", label: "Agudos" },
  { value: "medios", label: "Medios" },
  { value: "graves", label: "Graves" },
  { value: "parches", label: "Parches" },
  { value: "baquetas-y-palillos", label: "Baquetas y Palillos" },
  { value: "correas", label: "Correas" },
  { value: "tensores-y-llaves", label: "Tensores y Llaves" },
  { value: "fundas", label: "Fundas" },
]

export const brandFilters: { value: string; label: string }[] = [
  { value: "gope", label: "Gope" },
  { value: "ivsom", label: "IVSOM" },
  { value: "contemporanea", label: "Contemporânea" },
  { value: "izzo", label: "Izzo" },
  { value: "king", label: "King" },
  { value: "redencao", label: "Redenção" },
]

export const registerLabels: Record<string, string> = {
  AGUDO: "Agudo",
  MEDIO: "Medio",
  GRAVE: "Grave",
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(price)
}

export function getProductBySlug(slug: string): any | undefined {
  return products.find((p: any) => p.slug === slug)
}

/** Obtiene las marcas únicas de las variantes de un producto */
export function getProductBrands(product: any): string[] {
  if (!product.variants?.length) return []
  const brands = new Set<string>()
  for (const v of product.variants) {
    if (v.brand?.name) brands.add(v.brand.name)
  }
  return Array.from(brands)
}
