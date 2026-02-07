"use client"

import Image from "next/image"
import { Minus, Plus, Trash2, MessageCircle, ShoppingCart } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/data"

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, buildWhatsAppUrl } =
    useCartStore()

  const total = totalPrice()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-border bg-white shadow-2xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-border pb-4 text-left">
          <SheetTitle className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Tu carrito
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {items.length === 0
              ? "Tu carrito está vacío"
              : `${items.length} producto${items.length !== 1 ? "s" : ""} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-xl bg-gray-50 p-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Agregá productos desde el catálogo para armar tu pedido por WhatsApp
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="-mx-6 flex-1 px-6">
              <div className="flex flex-col gap-3 py-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-carnival-accent">
                          {item.product.brand}
                        </p>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.product.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-gray-200 bg-white hover:bg-gray-100"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-gray-200 bg-white hover:bg-gray-100"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => removeItem(item.product.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Eliminar ${item.product.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold text-carnival-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border bg-white pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="font-display text-2xl text-carnival-primary sm:text-3xl">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                asChild
                className="w-full rounded-full bg-[#25D366] py-6 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#20BD5A]"
              >
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3"
                >
                  <MessageCircle className="h-5 w-5" />
                  Confirmar pedido por WhatsApp
                </a>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
