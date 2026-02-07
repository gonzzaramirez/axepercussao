import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { products, getProductBySlug, formatPrice, getCategoryLabel } from "@/lib/data"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return { title: "Producto no encontrado | Axé Percussão" }
  }

  return {
    title: `${product.name} | Axé Percussão`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Axé Percussão`,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: getCategoryLabel(product.category),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
    },
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: "/productos",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `/productos/${product.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-24 pb-16">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  )
}
