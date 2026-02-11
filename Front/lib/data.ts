// Utilidades y filtros estáticos (sin datos mock de productos)

export const categoryFilters: { value: string; label: string }[] = [
  { value: "agudos", label: "Agudos" },
  { value: "medios", label: "Medios" },
  { value: "graves", label: "Graves" },
  { value: "parches", label: "Parches" },
  { value: "baquetas-y-palillos", label: "Baquetas y Palillos" },
  { value: "correas", label: "Correas" },
  { value: "tensores-y-llaves", label: "Tensores y Llaves" },
  { value: "fundas", label: "Fundas" },
];

export const brandFilters: { value: string; label: string }[] = [
  { value: "gope", label: "Gope" },
  { value: "ivsom", label: "IVSOM" },
  { value: "contemporanea", label: "Contemporânea" },
  { value: "izzo", label: "Izzo" },
  { value: "king", label: "King" },
  { value: "redencao", label: "Redenção" },
];

export const registerLabels: Record<string, string> = {
  AGUDO: "Agudo",
  MEDIO: "Medio",
  GRAVE: "Grave",
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(price);
}

/** Obtiene las marcas únicas de las variantes de un producto */
export function getProductBrands(product: { variants?: Array<{ brand?: { name?: string } }> }): string[] {
  if (!product.variants?.length) return [];
  const brands = new Set<string>();
  for (const v of product.variants) {
    if (v.brand?.name) brands.add(v.brand.name);
  }
  return Array.from(brands);
}
