"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Drum, Paintbrush, Shirt } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const services = [
  {
    icon: Drum,
    title: "Instrumentos y accesorios",
    description:
      "Surdos, repiques, tamborins, chocalhos y todo lo que tu batería necesita. Marcas top: Gope, IVSOM, Contemporánea.",
    color: "bg-carnival-primary",
    bar: "bg-carnival-primary",
    glow: "shadow-carnival-primary/25",
  },
  {
    icon: Paintbrush,
    title: "Parches personalizados",
    description:
      "Sublimación de parches en cualquier medida. Tu logo, tu diseño, tu identidad sonando en la calle.",
    color: "bg-carnival-accent",
    bar: "bg-carnival-accent",
    glow: "shadow-carnival-accent/25",
  },
  {
    icon: Shirt,
    title: "Logos y estampas para remeras",
    description:
      "Casacas sublimadas de cualquier estilo. Diseñamos a tu medida o trabajamos con tus propios diseños.",
    color: "bg-carnival-primary",
    bar: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
]

export function Services() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background pt-4 pb-12 sm:pt-6 lg:pt-8 lg:pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,109,0,0.06)_0%,transparent_50%)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 text-center sm:mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-carnival-primary/30 bg-carnival-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-carnival-primary">
            Lo que hacemos
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
            RITMO, COLOR Y PASIÓN
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Todo lo que necesitás para tu batería, en un solo lugar
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.12, duration: 0.5 }}
            >
              <Card className="relative h-full overflow-hidden rounded-2xl border-2 border-border bg-card">
                <div className={`h-1.5 w-full ${service.bar}`} />
                <CardContent className="p-4 sm:p-5">
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${service.color} shadow-lg ${service.glow} sm:h-16 sm:w-16`}
                  >
                    <service.icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="mb-2 font-display text-xl tracking-tight text-foreground sm:text-2xl">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
