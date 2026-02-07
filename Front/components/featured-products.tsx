"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export function FeaturedProducts() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const featured = products.filter((p) => p.featured)

  return (
    <section id="destacados" ref={ref} className="relative bg-secondary/40 py-16 lg:py-24">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="inline-block rounded-full border border-carnival-primary/20 bg-carnival-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-carnival-primary">
              Destacados
            </span>
            <h2 className="mt-2 font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              NUESTRO CATÁLOGO
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            size="default"
            className="w-full rounded-full border-2 border-carnival-primary/30 bg-transparent font-semibold text-carnival-primary hover:bg-carnival-primary hover:text-white sm:w-auto"
          >
            <Link href="/productos" className="flex items-center justify-center gap-2">
              Ver todo el catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  )
}
