import type { CartItem } from "@/types"
import { formatPrice } from "@/lib/data"
import { getEffectivePrice, getVariantDescription } from "@/types"

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59899999999"

interface CustomerData {
  firstName: string
  lastName: string
  phone: string
  dni: string
  street: string
  apartment?: string
  city: string
  province: string
  customerNotes?: string
}

export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  customer: CustomerData,
  orderId?: string,
  discountCode?: string,
  discountPercent?: number
): string {
  const header = orderId
    ? `*PEDIDO AXÉ PERCUSSÃO* #${orderId.slice(0, 8).toUpperCase()}`
    : `*PEDIDO AXÉ PERCUSSÃO*`

  const itemLines = items
    .map((item) => {
      const price = getEffectivePrice(item.product, item.selectedVariant)
      const variantPart = item.selectedVariant
        ? ` (${getVariantDescription(item.selectedVariant)})`
        : ""
      return `${item.quantity}x ${item.product.name}${variantPart} - ${formatPrice(price * item.quantity)}`
    })
    .join("\n")

  const discountLine =
    discountCode && discountPercent
      ? `\nDescuento: ${discountCode} (-${discountPercent}%)`
      : ""

  const address = `${customer.street}${customer.apartment ? `, ${customer.apartment}` : ""}, ${customer.city}, ${customer.province}`

  const notesLine = customer.customerNotes ? `\n_${customer.customerNotes}_` : ""

  const message = `${header}
${itemLines}${discountLine}
*Total: ${formatPrice(total)}*
---
*${customer.firstName} ${customer.lastName}* | ${customer.phone}
DNI: ${customer.dni}
${address}${notesLine}`

  return message
}

export function createWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/** Genera URL de WhatsApp simple para consultas */
export function createSimpleWhatsAppUrl(productName?: string): string {
  const message = productName
    ? `Hola Axé Percussão! Quiero consultar sobre: ${productName}`
    : "Hola Axé Percussão! Quiero hacer una consulta"
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
