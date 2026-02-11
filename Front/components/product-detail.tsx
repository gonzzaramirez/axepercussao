"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductVariant, Brand } from "@/types";
import {
  getEffectivePrice,
  getVariantDescription,
  getAvailableVariants,
} from "@/types";
import { formatPrice, registerLabels } from "@/lib/data";
import { useCart } from "@/context/cart-context";

// ─── Helpers ────────────────────────────────────────────────

/** Ordena medidas numéricamente: 8" < 10" < 12" < 14" < 18"x50cm */
function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const numA = parseFloat(a.replace(/[^0-9.,]/g, "").replace(",", "."));
    const numB = parseFloat(b.replace(/[^0-9.,]/g, "").replace(",", "."));
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
}

// ─── Component ──────────────────────────────────────────────

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, setIsOpen } = useCart();

  // Todas las variantes activas (para detectar si existe el producto con variantes)
  const allVariants = getAvailableVariants(product);

  // Solo variantes CON stock > 0 → la cascada se alimenta exclusivamente de estas.
  // Si una marca/medida/modelo no tiene stock, directamente no aparece.
  const variants = useMemo(
    () => allVariants.filter((v) => v.stockQuantity > 0),
    [allVariants],
  );
  const hasVariants = variants.length > 0;
  const allOutOfStock = allVariants.length > 0 && variants.length === 0;
  const isInactive = product.isActive === false;

  // ── ¿Qué dimensiones de atributo existen en las variantes con stock? ──
  const hasBrands = useMemo(
    () => variants.some((v) => v.brand && v.brandId),
    [variants],
  );
  const hasSizes = useMemo(() => variants.some((v) => !!v.size), [variants]);
  const hasModels = useMemo(() => variants.some((v) => !!v.model), [variants]);
  const hasMaterials = useMemo(
    () => variants.some((v) => !!v.material),
    [variants],
  );

  // ── Estado de selección ──
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // ══════════════════════════════════════════════════════════════
  // OPCIONES DISPONIBLES EN CASCADA
  //
  // Cada nivel se filtra por las selecciones de ARRIBA:
  //   Marca → Medida → Modelo → Material
  //
  // Si una marca no tiene cierta medida, esa medida NO aparece.
  // Si una marca+medida no tiene cierto modelo, ese modelo NO aparece.
  // Esto elimina combinaciones imposibles de la UI.
  // ══════════════════════════════════════════════════════════════

  // Nivel 1: Marcas (sin filtro superior — siempre muestra todas)
  const availableBrands = useMemo(() => {
    if (!hasBrands) return [];
    const map = new Map<number, Brand>();
    for (const v of variants) {
      if (v.brand && v.brandId) map.set(v.brandId, v.brand);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [variants, hasBrands]);

  // Nivel 2: Medidas (filtradas por marca seleccionada)
  const availableSizes = useMemo(() => {
    if (!hasSizes) return [];
    let pool = variants;
    if (selectedBrandId !== null)
      pool = pool.filter((v) => v.brandId === selectedBrandId);
    const set = new Set<string>();
    for (const v of pool) {
      if (v.size) set.add(v.size);
    }
    return sortSizes(Array.from(set));
  }, [variants, hasSizes, selectedBrandId]);

  // Nivel 3: Modelos (filtrados por marca + medida)
  const availableModels = useMemo(() => {
    if (!hasModels) return [];
    let pool = variants;
    if (selectedBrandId !== null)
      pool = pool.filter((v) => v.brandId === selectedBrandId);
    if (selectedSize !== null)
      pool = pool.filter((v) => v.size === selectedSize);
    const set = new Set<string>();
    for (const v of pool) {
      if (v.model) set.add(v.model);
    }
    return Array.from(set).sort();
  }, [variants, hasModels, selectedBrandId, selectedSize]);

  // Nivel 4: Materiales (filtrados por marca + medida + modelo)
  const availableMaterials = useMemo(() => {
    if (!hasMaterials) return [];
    let pool = variants;
    if (selectedBrandId !== null)
      pool = pool.filter((v) => v.brandId === selectedBrandId);
    if (selectedSize !== null)
      pool = pool.filter((v) => v.size === selectedSize);
    if (selectedModel !== null)
      pool = pool.filter((v) => v.model === selectedModel);
    const set = new Set<string>();
    for (const v of pool) {
      if (v.material) set.add(v.material);
    }
    return Array.from(set).sort();
  }, [variants, hasMaterials, selectedBrandId, selectedSize, selectedModel]);

  // ══════════════════════════════════════════════════════════════
  // AUTO-SELECCIÓN Y LIMPIEZA EN CASCADA
  //
  // - Si solo queda 1 opción en un nivel → auto-seleccionar
  // - Si la opción seleccionada ya no existe → limpiar
  // ══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (availableBrands.length === 1 && selectedBrandId === null) {
      setSelectedBrandId(availableBrands[0].id);
    }
  }, [availableBrands, selectedBrandId]);

  useEffect(() => {
    if (
      selectedSize !== null &&
      availableSizes.length > 0 &&
      !availableSizes.includes(selectedSize)
    ) {
      setSelectedSize(null);
    } else if (availableSizes.length === 1 && selectedSize === null) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (
      selectedModel !== null &&
      availableModels.length > 0 &&
      !availableModels.includes(selectedModel)
    ) {
      setSelectedModel(null);
    } else if (availableModels.length === 1 && selectedModel === null) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);

  useEffect(() => {
    if (
      selectedMaterial !== null &&
      availableMaterials.length > 0 &&
      !availableMaterials.includes(selectedMaterial)
    ) {
      setSelectedMaterial(null);
    } else if (availableMaterials.length === 1 && selectedMaterial === null) {
      setSelectedMaterial(availableMaterials[0]);
    }
  }, [availableMaterials, selectedMaterial]);

  // ── Handlers: seleccionar + limpiar niveles inferiores ──

  const handleBrandSelect = useCallback((brandId: number) => {
    setSelectedBrandId(brandId);
    setSelectedSize(null);
    setSelectedModel(null);
    setSelectedMaterial(null);
  }, []);

  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
    setSelectedModel(null);
    setSelectedMaterial(null);
  }, []);

  const handleModelSelect = useCallback((model: string) => {
    setSelectedModel(model);
    setSelectedMaterial(null);
  }, []);

  const handleMaterialSelect = useCallback((material: string) => {
    setSelectedMaterial(material);
  }, []);

  // ── Variante que coincide con toda la selección ──
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!hasVariants) return undefined;
    return variants.find((v) => {
      if (hasBrands && v.brandId !== selectedBrandId) return false;
      if (hasSizes && v.size !== selectedSize) return false;
      if (hasModels && v.model !== selectedModel) return false;
      if (hasMaterials && v.material !== selectedMaterial) return false;
      return true;
    });
  }, [
    variants,
    hasVariants,
    hasBrands,
    hasSizes,
    hasModels,
    hasMaterials,
    selectedBrandId,
    selectedSize,
    selectedModel,
    selectedMaterial,
  ]);

  // Imagen activa sin parpadeos:
  // mantenemos la última imagen (producto o variante) hasta que haya una nueva variante seleccionada,
  // para evitar que vuelva a la imagen base entre clicks.
  const [activeImage, setActiveImage] = useState(
    selectedVariant?.imageUrl || product.image || "/placeholder.svg",
  );

  useEffect(() => {
    if (selectedVariant?.imageUrl && selectedVariant.imageUrl !== activeImage) {
      // Cambiamos a la imagen específica de la variante
      setActiveImage(selectedVariant.imageUrl);
    } else if (!selectedVariant && !hasVariants) {
      // Productos sin variantes: aseguramos que use la imagen base
      const base = product.image || "/placeholder.svg";
      if (base !== activeImage) {
        setActiveImage(base);
      }
    }
    // Si hay variantes pero ninguna está seleccionada (estado intermedio al cambiar filtros),
    // mantenemos la imagen previa para evitar parpadeo.
  }, [selectedVariant, hasVariants, product.image, activeImage]);

  // ── Rango de precios según selección parcial ──
  const priceInfo = useMemo(() => {
    if (selectedVariant) {
      const p = getEffectivePrice(product, selectedVariant);
      return { min: p, max: p };
    }
    let pool = variants;
    if (selectedBrandId !== null)
      pool = pool.filter((v) => v.brandId === selectedBrandId);
    if (selectedSize !== null)
      pool = pool.filter((v) => v.size === selectedSize);
    if (selectedModel !== null)
      pool = pool.filter((v) => v.model === selectedModel);
    if (selectedMaterial !== null)
      pool = pool.filter((v) => v.material === selectedMaterial);
    if (pool.length === 0) return { min: product.price, max: product.price };
    const prices = pool
      .map((v) => v.price ?? product.price)
      .filter((p) => p > 0);
    if (prices.length === 0) return { min: product.price, max: product.price };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [
    variants,
    product,
    selectedVariant,
    selectedBrandId,
    selectedSize,
    selectedModel,
    selectedMaterial,
  ]);

  const displayImage = activeImage;
  const isSelectionComplete = !hasVariants || !!selectedVariant;
  const stock = selectedVariant?.stockQuantity ?? product.stockQuantity ?? 0;

  // Cuántas selecciones faltan
  const selectionsNeeded = useMemo(() => {
    if (!hasVariants) return 0;
    let needed = 0;
    if (hasBrands && selectedBrandId === null) needed++;
    if (hasSizes && selectedSize === null) needed++;
    if (hasModels && selectedModel === null) needed++;
    if (hasMaterials && selectedMaterial === null) needed++;
    return needed;
  }, [
    hasVariants,
    hasBrands,
    hasSizes,
    hasModels,
    hasMaterials,
    selectedBrandId,
    selectedSize,
    selectedModel,
    selectedMaterial,
  ]);

  const handleAddToCart = () => {
    if (isInactive) return;
    if (hasVariants && !selectedVariant) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant);
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsOpen(true);
    }, 600);
  };

  // ── Animación para los selectores en cascada ──
  const selectorMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.2 },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              href="/productos"
              className="transition-colors hover:text-foreground"
            >
              Productos
            </Link>
          </li>
          {product.category && (
            <>
              <li>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link
                  href={`/productos?cat=${product.category.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="font-medium text-foreground truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.featured && (
              <Badge className="absolute left-4 top-4 rounded-full bg-carnival-primary text-white border-transparent hover:bg-carnival-primary">
                Destacado
              </Badge>
            )}
            {product.instrumentRegister && (
              <Badge
                variant="outline"
                className="absolute right-4 top-4 rounded-full border-white/30 bg-black/40 text-white backdrop-blur-sm"
              >
                {registerLabels[product.instrumentRegister] ||
                  product.instrumentRegister}
              </Badge>
            )}
            {isInactive && (
              <Badge className="absolute left-4 bottom-4 rounded-full border-transparent bg-destructive text-destructive-foreground hover:bg-destructive">
                Producto inactivo
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {product.category && (
                <Badge
                  variant="outline"
                  className="rounded-full border-border text-xs font-medium text-muted-foreground"
                >
                  {product.category.name}
                </Badge>
              )}
              {product.productType && (
                <Badge
                  variant="outline"
                  className="rounded-full border-border text-xs font-medium text-muted-foreground"
                >
                  {product.productType === "INSTRUMENT"
                    ? "Instrumento"
                    : "Accesorio"}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
          </div>

          {isInactive && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Producto inactivo
                </p>
                <p className="text-xs text-muted-foreground">
                  Este producto ya no está disponible para compra, pero dejamos
                  la ficha como referencia. Si necesitás algo similar,
                  escribinos por WhatsApp.
                </p>
              </div>
            </div>
          )}

          <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {product.description}
          </p>

          {/* Sin stock — todas las variantes agotadas */}
          {allOutOfStock && !isInactive && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Sin stock disponible
                </p>
                <p className="text-xs text-muted-foreground">
                  Todas las variantes de este producto están agotadas.
                  Consultanos por WhatsApp para más info.
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              SELECTORES DE VARIANTE EN CASCADA
              Solo se muestra cada nivel si tiene opciones con stock.
              Al seleccionar, los niveles inferiores se actualizan.
              ════════════════════════════════════════════════════ */}
          {hasVariants && (
            <div className="mb-6 space-y-5">
              {/* Nivel 1 — Marca */}
              {availableBrands.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Marca
                    {availableBrands.length === 1 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (única disponible)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          selectedBrandId === brand.id
                            ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary shadow-sm shadow-carnival-primary/10"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nivel 2 — Medida (solo si hay medidas disponibles para la marca seleccionada) */}
              <AnimatePresence mode="wait">
                {availableSizes.length > 0 &&
                  (hasBrands ? selectedBrandId !== null : true) && (
                    <motion.div key="sizes" {...selectorMotion}>
                      <p className="mb-2 text-sm font-semibold text-foreground">
                        Medida
                        {availableSizes.length === 1 && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (única disponible)
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeSelect(size)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              selectedSize === size
                                ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary shadow-sm shadow-carnival-primary/10"
                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Nivel 3 — Modelo (solo si hay modelos para marca+medida seleccionados) */}
              <AnimatePresence mode="wait">
                {availableModels.length > 0 &&
                  (hasSizes ? selectedSize !== null : true) &&
                  (hasBrands ? selectedBrandId !== null : true) && (
                    <motion.div key="models" {...selectorMotion}>
                      <p className="mb-2 text-sm font-semibold text-foreground">
                        Modelo
                        {availableModels.length === 1 && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (único disponible)
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableModels.map((model) => (
                          <button
                            key={model}
                            onClick={() => handleModelSelect(model)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              selectedModel === model
                                ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary shadow-sm shadow-carnival-primary/10"
                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Nivel 4 — Material (solo si hay materiales para marca+medida+modelo) */}
              <AnimatePresence mode="wait">
                {availableMaterials.length > 0 &&
                  (hasModels ? selectedModel !== null : true) &&
                  (hasSizes ? selectedSize !== null : true) &&
                  (hasBrands ? selectedBrandId !== null : true) && (
                    <motion.div key="materials" {...selectorMotion}>
                      <p className="mb-2 text-sm font-semibold text-foreground">
                        Material
                        {availableMaterials.length === 1 && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (único disponible)
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableMaterials.map((material) => (
                          <button
                            key={material}
                            onClick={() => handleMaterialSelect(material)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              selectedMaterial === material
                                ? "border-carnival-primary bg-carnival-primary/10 text-carnival-primary shadow-sm shadow-carnival-primary/10"
                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Indicador de selecciones restantes */}
              {!selectedVariant && selectionsNeeded > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectionsNeeded === 1
                    ? "Seleccioná 1 opción más para ver el precio."
                    : `Seleccioná ${selectionsNeeded} opciones para ver el precio.`}
                </p>
              )}
            </div>
          )}

          {/* Precio (rango o exacto) */}
          <div className="mb-6">
            {hasVariants && priceInfo.min !== priceInfo.max ? (
              <>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Desde
                </p>
                <p className="font-display text-4xl text-carnival-primary sm:text-5xl">
                  {formatPrice(priceInfo.min)}
                  <span className="ml-2 text-xl text-muted-foreground sm:text-2xl">
                    — {formatPrice(priceInfo.max)}
                  </span>
                </p>
              </>
            ) : (
              <p className="font-display text-4xl text-carnival-primary sm:text-5xl">
                {formatPrice(priceInfo.min)}
              </p>
            )}
          </div>

          {/* Selector de cantidad */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">
              Cantidad
            </span>
            <div className="flex items-center rounded-full border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isInactive}
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold text-foreground">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={
                  isInactive || (hasVariants && stock > 0 && quantity >= stock)
                }
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {hasVariants && stock > 0 && stock <= 5 && (
              <span className="text-xs text-amber-600">¡Quedan {stock}!</span>
            )}
          </div>

          {/* Botón agregar al carrito */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full rounded-full bg-carnival-primary px-8 py-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-carnival-primary/25 hover:bg-carnival-primary/90 sm:w-auto"
            disabled={
              added || !isSelectionComplete || allOutOfStock || isInactive
            }
          >
            {isInactive ? (
              <span className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                No disponible para compra
              </span>
            ) : added ? (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Agregado
              </span>
            ) : allOutOfStock ? (
              <span className="flex items-center gap-2">Sin stock</span>
            ) : !isSelectionComplete ? (
              <span className="flex items-center gap-2">
                Seleccioná las opciones
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Agregar al carrito
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
