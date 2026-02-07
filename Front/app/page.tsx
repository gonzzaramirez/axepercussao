import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { FeaturedProducts } from "@/components/featured-products"
import { CtaBanner } from "@/components/cta-banner"
import { About } from "@/components/about"
import { ContactSection } from "@/components/contact-section"
import { CartDrawer } from "@/components/cart-drawer"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Axé Percussão | Instrumentos de Carnaval",
  description:
    "Sumate a la vibra del carnaval. Instrumentos de percusión, parches personalizados y todo para tu batería. Pensado por y para el ritmista.",
  openGraph: {
    title: "Axé Percussão | Instrumentos de Carnaval",
    description:
      "Instrumentos de percusión, parches personalizados y todo para tu batería. Pensado por y para el ritmista.",
    type: "website",
  },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <Services />
        <FeaturedProducts />
        <CtaBanner />
        <About />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
