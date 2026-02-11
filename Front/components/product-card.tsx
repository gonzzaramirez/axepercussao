"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/data";
import { getAvailableVariants } from "@/types";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  product: Product;
  index?: number;
}

/** Obtiene las marcas únicas de las variantes */
function getBrandNames(product: Product): string[] {
  const variants = getAvailableVariants(product);
  if (!variants.length) return [];
  const names = new Set<string>();
  for (const v of variants) {
    if (v.brand?.name) names.add(v.brand.name);
  }
  return Array.from(names);
}

/** Si el producto tiene una sola variante sin opciones, la retorna para add rápido */
function getSingleVariant(product: Product) {
  const variants = getAvailableVariants(product);
  if (variants.length === 1) return variants[0];
  return undefined;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, setIsOpen } = useCart();
  const availableVariants = getAvailableVariants(product);
  const brandNames = getBrandNames(product);
  const hasMultipleOptions = availableVariants.length > 1;
  const singleVariant = getSingleVariant(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleOptions) {
      // Redirigir a detalle para elegir variante
      window.location.href = `/productos/${product.slug}`;
      return;
    }
    addItem(product, singleVariant);
    setIsOpen(true);
  };

  // Rango de precios si hay variantes con distintos precios
  const priceRange = (() => {
    if (!availableVariants.length) return null;
    const prices = availableVariants
      .filter((v) => v.price != null)
      .map((v) => v.price!);
    if (prices.length < 2) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return null;
    return { min, max };
  })();

  return (
    <div>
      <Link href={`/productos/${product.slug}`} className="block h-full">
        <Card className="group h-full overflow-hidden border-border bg-card transition-all hover:shadow-xl hover:shadow-carnival-primary/5 hover:-translate-y-1">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.featured && (
              <Badge className="absolute left-3 top-3 rounded-full bg-carnival-primary text-white border-transparent hover:bg-carnival-primary">
                Destacado
              </Badge>
            )}
            <Button
              onClick={handleAddToCart}
              size="icon"
              className="absolute bottom-3 right-3 h-11 w-11 rounded-full bg-carnival-primary text-white opacity-100 shadow-lg transition-all hover:bg-carnival-primary/90 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={
                hasMultipleOptions
                  ? `Ver opciones de ${product.name}`
                  : `Agregar ${product.name} al carrito`
              }
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="p-5">
            {/* Marcas disponibles */}
            {brandNames.length > 0 && (
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-carnival-accent">
                {brandNames.join(" · ")}
              </p>
            )}
            <h3 className="mb-1 text-base font-bold text-foreground leading-snug">
              {product.name}
            </h3>
            {product.category && (
              <p className="mb-2 text-xs text-muted-foreground">
                {product.category.name}
              </p>
            )}
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.shortDescription || product.description}
            </p>
            {availableVariants.length > 0 && (
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                {availableVariants.length} variante
                {availableVariants.length !== 1 ? "s" : ""} disponible
                {availableVariants.length !== 1 ? "s" : ""}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div>
                {priceRange ? (
                  <p className="font-display text-lg text-carnival-primary sm:text-xl">
                    {formatPrice(priceRange.min)}{" "}
                    <span className="text-sm text-muted-foreground">–</span>{" "}
                    {formatPrice(priceRange.max)}
                  </p>
                ) : (
                  <p className="font-display text-xl text-carnival-primary sm:text-2xl">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="sm"
                className="rounded-full border-carnival-primary/20 bg-transparent text-xs font-bold text-carnival-primary hover:bg-carnival-primary hover:text-white"
              >
                {hasMultipleOptions ? "Ver opciones" : "Agregar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
