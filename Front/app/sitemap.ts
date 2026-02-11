import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/api/product"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://axepercussao.com"

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  try {
    const products = await getProducts()
    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/productos/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
    return [...staticPages, ...productUrls]
  } catch {
    return staticPages
  }
}
