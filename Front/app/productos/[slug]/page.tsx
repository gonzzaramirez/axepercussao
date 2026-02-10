import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductBySlug as getProductBySlugAPI } from "@/lib/api/product"
import { getProductBySlug as getProductBySlugMock, formatPrice } from "@/lib/data"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import type { Product } from "@/types"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  // Intentar desde API
  try {
    const product = await getProductBySlugAPI(slug)
    if (product) return product
  } catch {
    // Fallback a mock
  }

  // Fallback
  const mock = getProductBySlugMock(slug)
  if (mock) {
    return { ...mock, image: mock.image || "/placeholder.svg" } as Product
  }
  return null
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: "Producto no encontrado | Axé Percussão" }
  }

  const brandNames = (product.variants ?? [])
    .map((v) => v.brand?.name)
    .filter(Boolean)
  const uniqueBrands = [...new Set(brandNames)]
  const brandStr = uniqueBrands.length > 0 ? ` | ${uniqueBrands.join(", ")}` : ""
  const title = `${product.name}${brandStr}`

  return {
    title: `${title} | Axé Percussão`,
    description: product.description,
    openGraph: {
      title: `${title} | Axé Percussão`,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const brandNames = (product.variants ?? [])
    .map((v) => v.brand?.name)
    .filter(Boolean)
  const uniqueBrands = [...new Set(brandNames)]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: uniqueBrands.length > 0
      ? { "@type": "Brand", name: uniqueBrands[0] }
      : { "@type": "Brand", name: "Axé Percussão" },
    category: product.category?.name || (product.productType === "INSTRUMENT" ? "Instrumento" : "Accesorio"),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "UYU",
      availability: "https://schema.org/InStock",
    },
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "/" },
      { "@type": "ListItem", position: 2, name: "Productos", item: "/productos" },
      ...(product.category
        ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `/productos?cat=${product.category.slug}` }]
        : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: `/productos/${product.slug}` },
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
