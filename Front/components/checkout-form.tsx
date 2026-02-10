"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/data"
import { getEffectivePrice, getVariantDescription } from "@/types"
import { createOrder } from "@/lib/api/order"
import { validateDiscountCode } from "@/lib/api/discount-code"
import { generateWhatsAppMessage, createWhatsAppUrl } from "@/lib/whatsapp"
import { Loader2, Tag, MessageCircle, ArrowLeft } from "lucide-react"

interface CheckoutFormProps {
  onBack: () => void
}

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Datos del cliente
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dni, setDni] = useState("")
  const [street, setStreet] = useState("")
  const [apartment, setApartment] = useState("")
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const [customerNotes, setCustomerNotes] = useState("")

  // Descuento
  const [discountInput, setDiscountInput] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountError, setDiscountError] = useState("")
  const [discountLoading, setDiscountLoading] = useState(false)

  const subtotal = totalPrice
  const discountAmount = discountPercent > 0 ? Math.round(subtotal * discountPercent / 100) : 0
  const total = subtotal - discountAmount

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return
    setDiscountLoading(true)
    setDiscountError("")
    try {
      const result = await validateDiscountCode(discountInput, subtotal)
      setDiscountCode(result.code)
      setDiscountPercent(result.discountPercent)
    } catch (err: any) {
      setDiscountError(err.message || "Código no válido")
      setDiscountCode("")
      setDiscountPercent(0)
    } finally {
      setDiscountLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const orderData = {
        firstName,
        lastName,
        email,
        phone,
        dni,
        street,
        apartment: apartment || undefined,
        city,
        province,
        customerNotes: customerNotes || undefined,
        discountCode: discountCode || undefined,
        discountPercent: discountPercent || undefined,
        items: items.map((item) => {
          const price = getEffectivePrice(item.product, item.selectedVariant)
          return {
            productId: item.product.id,
            variantId: item.selectedVariant?.id,
            productName: item.product.name,
            brandName: item.selectedVariant?.brand?.name,
            variantDesc: item.selectedVariant
              ? getVariantDescription(item.selectedVariant)
              : undefined,
            quantity: item.quantity,
            unitPrice: price,
          }
        }),
        totalAmount: total,
      }

      const order = await createOrder(orderData)

      // Generar mensaje WhatsApp
      const message = generateWhatsAppMessage(
        items,
        total,
        { firstName, lastName, phone, dni, street, apartment, city, province, customerNotes },
        order.id,
        discountCode,
        discountPercent
      )
      const whatsappUrl = createWhatsAppUrl(message)

      // Limpiar carrito y redirigir
      clearCart()
      window.open(whatsappUrl, "_blank")
      router.push(`/pedido/${order.id}`)
    } catch (err: any) {
      setError(err.message || "Error al crear el pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-2 -ml-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Volver al carrito
      </Button>

      <div>
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          DATOS PERSONALES
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="lastName">Apellido *</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+598..." required />
          </div>
          <div>
            <Label htmlFor="dni">Cédula / DNI *</Label>
            <Input id="dni" value={dni} onChange={(e) => setDni(e.target.value)} required />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          DIRECCIÓN DE ENVÍO
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="street">Calle y número *</Label>
            <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="apartment">Apto / Piso</Label>
            <Input id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="city">Ciudad *</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="province">Departamento / Provincia *</Label>
            <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)} required />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="Indicaciones de envío, horario de entrega, etc."
          className="mt-1"
        />
      </div>

      <Separator />

      {/* Código de descuento */}
      <div>
        <Label>Código de descuento</Label>
        <div className="mt-1 flex gap-2">
          <Input
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
            placeholder="Ej: DESCUENTO10"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyDiscount}
            disabled={discountLoading}
            className="shrink-0"
          >
            {discountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="mr-1 h-4 w-4" />}
            Aplicar
          </Button>
        </div>
        {discountError && <p className="mt-1 text-sm text-destructive">{discountError}</p>}
        {discountCode && (
          <p className="mt-1 text-sm text-green-600">
            Código {discountCode} aplicado: -{discountPercent}%
          </p>
        )}
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Resumen del pedido</h3>
        <div className="space-y-2 text-sm">
          {items.map((item, i) => {
            const price = getEffectivePrice(item.product, item.selectedVariant)
            const variantDesc = item.selectedVariant
              ? getVariantDescription(item.selectedVariant)
              : null
            return (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span className="flex-1">
                  {item.quantity}x {item.product.name}
                  {variantDesc && (
                    <span className="text-xs text-muted-foreground/70"> ({variantDesc})</span>
                  )}
                </span>
                <span className="ml-2 shrink-0">{formatPrice(price * item.quantity)}</span>
              </div>
            )
          })}
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento ({discountCode})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span className="font-display text-xl text-carnival-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full rounded-full bg-[#25D366] py-6 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#20BD5A]"
      >
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <MessageCircle className="mr-2 h-5 w-5" />
        )}
        Confirmar pedido por WhatsApp
      </Button>
    </form>
  )
}
