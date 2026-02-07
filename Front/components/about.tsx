"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PLACEHOLDER_IMAGE = "/placeholder.svg";

const values = [
  {
    id: "pasion",
    title: "Pasión",
    text: "Nacemos de la pasión de dos ritmistas que viven el carnaval desde adentro.",
  },
  {
    id: "profesionalismo",
    title: "Profesionalismo",
    text: "La ética y el compromiso son pilares fundamentales en cada proyecto.",
  },
  {
    id: "confidencialidad",
    title: "Confidencialidad",
    text: "Las ideas, colores y conceptos de tu batería se mantienen seguros y exclusivos.",
  },
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-background py-16 lg:py-24"
    >
      <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-carnival-primary/5 blur-3xl md:h-96 md:w-96" />
      <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-carnival-accent/5 blur-3xl md:h-80 md:w-80" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-16 xl:gap-20">
          <motion.div
            className="shrink-0 lg:w-1/2"
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary shadow-lg">
                <Image
                  src={PLACEHOLDER_IMAGE}
                  alt="Placeholder: batería de carnaval Axé Percussão"
                  fill
                  className="object-cover"
                />
              </div>
              <motion.div
                className="absolute -bottom-4 -right-2 rounded-xl bg-carnival-primary px-4 py-3 text-white shadow-lg shadow-carnival-primary/25 sm:-right-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <p className="font-display text-3xl leading-none">+2</p>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  Años de carnaval
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="mb-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              AXÉ PERCUSSÃO
            </h2>

            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Axé Percussão nace de la pasión de dos ritmistas que viven el
                carnaval desde adentro. Nuestra misión es llegar al ritmista con
                pasión, compromiso y accesibilidad, cuidando cada detalle: desde
                los precios hasta los tiempos de entrega.
              </p>
              <p>
                Cuidamos, honramos y preservamos el carnaval, porque entendemos
                su valor y su historia.
              </p>
            </div>

            <div className="mt-6 sm:mt-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Nuestros valores
              </p>
              <Accordion type="single" collapsible className="w-full">
                {values.map((value) => (
                  <AccordionItem
                    key={value.id}
                    value={value.id}
                    className="rounded-xl border border-border bg-card px-4 transition-colors hover:bg-secondary/50 [&:not(:last-child)]:mb-2"
                  >
                    <AccordionTrigger className="py-4 text-left font-semibold text-foreground hover:no-underline [&[data-state=open]]:text-carnival-primary">
                      {value.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0 text-sm leading-relaxed text-muted-foreground">
                      {value.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
