import React from "react"
import type { Metadata, Viewport } from "next"
import { Bebas_Neue, Manrope } from "next/font/google"

import "./globals.css"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://axepercussao.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Axé Percussão | Instrumentos de Carnaval",
    template: "%s | Axé Percussão",
  },
  description:
    "Instrumentos de percusión de alta gama para ritmistas profesionales y directores de batería. Surdos, Repiques, accesorios y personalización.",
  keywords: [
    "percusión",
    "carnaval",
    "instrumentos",
    "surdo",
    "repique",
    "tamborim",
    "batería",
    "ritmista",
    "Gope",
    "IVSOM",
    "Contemporânea",
    "Uruguay",
  ],
  authors: [{ name: "Axé Percussão" }],
  creator: "Axé Percussão",
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: SITE_URL,
    siteName: "Axé Percussão",
    title: "Axé Percussão | Instrumentos de Carnaval",
    description:
      "Instrumentos de percusión de alta gama para ritmistas. Pensado por y para el ritmista.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Axé Percussão - Instrumentos de Carnaval",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axé Percussão | Instrumentos de Carnaval",
    description:
      "Instrumentos de percusión de alta gama para ritmistas. Pensado por y para el ritmista.",
    images: ["/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: "#FF6D00",
  width: "device-width",
  initialScale: 1,
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Axé Percussão",
  url: SITE_URL,
  logo: `${SITE_URL}/placeholder-logo.svg`,
  sameAs: [
    "https://instagram.com/axe_percussao_",
    "https://facebook.com/axepercussao",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["Spanish"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  )
}
