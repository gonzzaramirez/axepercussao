import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Axé Percussão",
    short_name: "Axé",
    description:
      "Instrumentos de percusión de alta gama para ritmistas. Pensado por y para el ritmista.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF6D00",
    icons: [
      {
        src: "/placeholder-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
