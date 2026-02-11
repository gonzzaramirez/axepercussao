"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { products as mockProducts } from "@/lib/data";
import { getProducts } from "@/lib/api/product";
import { getCategories } from "@/lib/api/category";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Category } from "@/types";
import { getAvailableVariants } from "@/types";

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "recommended" | "price_asc" | "price_desc"
  >("recommended");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
        setIsLoading(false);
      })
      .catch(() => {
        setProducts(
          mockProducts.map(
            (p) => ({ ...p, image: p.image || "/placeholder.svg" }) as Product,
          ),
        );
        setIsLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const byFilters = products.filter((p) => {
      // Filtro por tipo
      if (selectedType && p.productType !== selectedType) return false;

      // Filtro por categoría (slug)
      if (selectedCategories.length > 0) {
        const catSlug = p.category?.slug ?? "";
        if (!selectedCategories.includes(catSlug)) return false;
      }

      // Filtro por marca (buscar en variantes)
      if (selectedBrands.length > 0) {
        const productBrandSlugs = getAvailableVariants(p)
          .map((v) => v.brand?.slug)
          .filter(Boolean) as string[];
        if (!selectedBrands.some((b) => productBrandSlugs.includes(b)))
          return false;
      }

      // Buscador por nombre / descripción / SKU / marca
      if (search.trim()) {
        const q = search.toLowerCase();
        const brandNames = getAvailableVariants(p)
          .map((v) => v.brand?.name?.toLowerCase())
          .filter(Boolean) as string[];

        const matchesText =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          brandNames.some((name) => name.includes(q));

        if (!matchesText) return false;
      }

      return true;
    });

    const getMinPrice = (product: Product): number => {
      const variants = getAvailableVariants(product);
      const prices = variants
        .map((v) => v.price ?? product.price ?? 0)
        .filter((price) => price > 0);

      if (prices.length === 0) return product.price ?? 0;
      return Math.min(...prices);
    };

    if (sortBy === "recommended") return byFilters;

    const withPrices = [...byFilters];
    withPrices.sort((a, b) => {
      const priceA = getMinPrice(a);
      const priceB = getMinPrice(b);
      if (sortBy === "price_asc") return priceA - priceB;
      return priceB - priceA;
    });

    return withPrices;
  }, [
    products,
    selectedCategories,
    selectedBrands,
    selectedType,
    search,
    sortBy,
  ]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
  };

  const handleBrandChange = (slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug],
    );
  };

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedType(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10">
        <Badge className="mb-3 rounded-full bg-carnival-primary/10 text-carnival-primary border-carnival-primary/20 hover:bg-carnival-primary/10">
          Instrumentos &amp; Accesorios
        </Badge>
        <h1 className="font-display text-5xl tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          CATÁLOGO
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? "s" : ""} encontrado
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <ProductFilters
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              selectedType={selectedType}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onTypeChange={handleTypeChange}
              onClearAll={handleClearAll}
              categories={categories}
            />
          </div>
        </aside>

        <div className="contents lg:hidden">
          <Button
            onClick={() => setShowMobileFilters(true)}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-carnival-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-carnival-primary/20 lg:hidden"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>

          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm lg:hidden">
              <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    Filtros
                  </h3>
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    variant="outline"
                    size="icon"
                    className="rounded-full border-border bg-transparent"
                    aria-label="Cerrar filtros"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ProductFilters
                  selectedCategories={selectedCategories}
                  selectedBrands={selectedBrands}
                  selectedType={selectedType}
                  onCategoryChange={handleCategoryChange}
                  onBrandChange={handleBrandChange}
                  onTypeChange={handleTypeChange}
                  onClearAll={handleClearAll}
                  categories={categories}
                />
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="mt-6 w-full rounded-full bg-carnival-primary py-6 text-sm font-bold text-white"
                >
                  Ver {filteredProducts.length} resultado
                  {filteredProducts.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* Buscador + ordenamiento */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, marca o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-full border-border bg-background pl-9 text-sm"
                aria-label="Buscar productos"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
                Ordenar por
              </span>
              <Select
                value={sortBy}
                onValueChange={(v) =>
                  setSortBy(v as "recommended" | "price_asc" | "price_desc")
                }
              >
                <SelectTrigger className="h-11 w-full rounded-full border-border bg-background text-sm sm:w-56">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                  <SelectItem value="price_asc">
                    Precio: menor a mayor
                  </SelectItem>
                  <SelectItem value="price_desc">
                    Precio: mayor a menor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-carnival-primary"
                aria-label="Cargando productos"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Cargando productos...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="mb-2 font-display text-3xl text-foreground">
                SIN RESULTADOS
              </p>
              <p className="text-sm text-muted-foreground">
                Probá ajustando los filtros para encontrar lo que buscás.
              </p>
              <Button
                onClick={handleClearAll}
                variant="link"
                className="mt-2 text-sm font-bold text-carnival-primary"
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
