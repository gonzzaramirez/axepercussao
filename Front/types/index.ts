// ─── Enums (deben coincidir con Prisma) ───────────────────

export type ProductType = "INSTRUMENT" | "ACCESSORY"
export type InstrumentRegister = "AGUDO" | "MEDIO" | "GRAVE"
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "CANCELLED"

// ─── Marcas ──────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  slug: string
  logoUrl?: string
  website?: string
  isActive?: boolean
}

// ─── Categorías ───────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
  _count?: { products: number }
}

// ─── Variantes de producto ────────────────────────────────

export interface ProductVariant {
  id: string
  productId: string
  brandId?: number
  sku: string
  size?: string       // "12\"", "14\"", "18\"", etc.
  model?: string      // "2 bocas", "4 bocas", "con caja", "vazada"
  material?: string   // "plástico", "cuero", "bamboo"
  price?: number
  stockQuantity: number
  imageUrl?: string
  isActive: boolean
  brand?: Brand
}

// ─── Producto ─────────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  name: string
  sku?: string
  description: string
  shortDescription?: string
  price: number
  stockQuantity?: number
  imageUrl?: string
  images?: string[]
  isActive?: boolean
  isFeatured?: boolean
  productType?: ProductType
  instrumentRegister?: InstrumentRegister
  categoryId?: number
  requiresAvailabilityCheck?: boolean

  // Descuentos
  discountPercent?: number
  discountStartDate?: string
  discountEndDate?: string
  minQuantityDiscount?: number
  quantityDiscountPercent?: number

  // Relaciones
  category?: Category
  variants?: ProductVariant[]

  // ─── Campos derivados para UI ────────────────────────
  image: string      // alias de imageUrl
  featured?: boolean // alias de isFeatured
}

// ─── Carrito ──────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
  selectedVariant?: ProductVariant
}

// ─── Pedido ───────────────────────────────────────────────

export interface OrderItem {
  id?: string
  productId: string
  variantId?: string
  productName: string
  brandName?: string
  variantDesc?: string
  quantity: number
  unitPrice: number
}

export interface GuestCustomer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  street: string
  apartment?: string
  city: string
  province: string
}

export interface Order {
  id: string
  status: OrderStatus
  totalAmount: number
  customerNotes?: string
  trackingCode?: string
  courierName?: string
  adminNotes?: string
  discountCode?: string
  discountPercent?: number
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  shippedAt?: string
  guestCustomer?: GuestCustomer
  items: OrderItem[]
  customer?: {
    name: string
    city: string
    province: string
  }
}

export interface CreateOrderDto {
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  street: string
  apartment?: string
  city: string
  province: string
  customerNotes?: string
  discountCode?: string
  discountPercent?: number
  items: {
    productId: string
    variantId?: string
    productName: string
    brandName?: string
    variantDesc?: string
    quantity: number
    unitPrice: number
  }[]
  totalAmount: number
}

// ─── Código de descuento ──────────────────────────────────

export interface DiscountCode {
  id: string
  code: string
  description?: string
  discountPercent: number
  isActive: boolean
  validFrom?: string
  validUntil?: string
  usageLimit?: number
  usageCount: number
  minOrderAmount?: number
}

export interface ValidateDiscountCodeResponse {
  valid: boolean
  code: string
  discountPercent: number
  description?: string
}

// ─── Auth ─────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

// ─── Estadísticas ─────────────────────────────────────────

export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  shipped: number
  cancelled: number
  revenue: number
}

// ─── Historial de precios ─────────────────────────────────

export interface PriceHistory {
  id: string
  productId: string
  oldPrice: number
  newPrice: number
  changePercent: number
  reason?: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────

/** Obtiene el precio efectivo de una variante o producto */
export function getEffectivePrice(product: Product, variant?: ProductVariant): number {
  return variant?.price ?? product.price ?? 0
}

/** Genera descripción legible de una variante */
export function getVariantDescription(variant: ProductVariant): string {
  const parts: string[] = []
  if (variant.brand?.name) parts.push(variant.brand.name)
  if (variant.size) parts.push(variant.size)
  if (variant.model) parts.push(variant.model)
  if (variant.material) parts.push(variant.material)
  return parts.join(" · ")
}
