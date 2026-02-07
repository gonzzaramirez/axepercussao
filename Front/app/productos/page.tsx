import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { Footer } from "@/components/footer"
import { ProductCatalog } from "@/components/product-catalog"

export const metadata: Metadata = {
  title: "Catálogo | Axé Percussão",
  description:
    "Explorá nuestro catálogo completo de instrumentos de percusión: surdos, repiques, tamborins, chocalhos y accesorios de las mejores marcas brasileñas.",
  openGraph: {
    title: "Catálogo | Axé Percussão",
    description:
      "Instrumentos de percusión de las mejores marcas brasileñas. Surdos, repiques, tamborins y más.",
  },
}

export default function ProductosPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-24">
        <ProductCatalog />
        <Footer />
      </main>
    </>
  )
}
