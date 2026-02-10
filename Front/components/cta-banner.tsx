"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-carnival-primary shadow-xl shadow-carnival-primary/20"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-carnival-accent/20" />

          <div className="relative z-10 flex flex-col items-center gap-5 px-6 py-12 text-center sm:gap-6 sm:px-8 sm:py-16 md:py-20">
            <motion.h2
              className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              PERSONALIZÁ TU BATERÍA
            </motion.h2>

            <motion.p
              className="max-w-lg text-sm leading-relaxed text-white/90 sm:text-base md:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Sublimación de parches de cualquier medida. Casacas sublimadas de
              cualquier estilo. Diseñamos a tu medida o trabajamos con tus
              propios diseños.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-white px-6 py-5 font-bold uppercase tracking-wider text-carnival-primary shadow-lg hover:bg-white/95 sm:w-auto sm:px-8 sm:py-6"
              >
                <a
                  href="https://wa.me/5491100000000?text=Hola%20Axe%20Percussao!%20Quiero%20consultar%20por%20personalizacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  Consultanos por WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
