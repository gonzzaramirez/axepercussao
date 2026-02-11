"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLUR_DATA_URL } from "@/lib/image-blur";

const HERO_IMAGE = "/hero.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Batería y percusión de carnaval"
          fill
          className="object-cover object-center max-md:object-top"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          quality={80}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(0,0,0,0.25)_100%)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.h1
          className="font-display leading-[0.9] tracking-tight text-white text-5xl drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="block">AXÉ</span>
          <span className="block text-carnival-primary">PERCUSSÃO</span>
        </motion.h1>

        <motion.p
          className="mt-4 max-w-md text-base leading-relaxed text-white/95 drop-shadow-md sm:mt-6 sm:max-w-lg sm:text-lg md:text-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Sumate a la vibra del carnaval. Instrumentos, parches personalizados y
          todo para tu batería.
        </motion.p>

        <motion.p
          className="mt-2 font-display text-lg tracking-wider text-carnival-primary drop-shadow-md sm:text-xl md:text-2xl lg:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          PENSADO POR Y PARA EL RITMISTA
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-carnival-primary px-6 py-5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-carnival-primary/25 hover:bg-carnival-primary/90 sm:w-auto sm:px-8 sm:py-6"
          >
            <Link
              href="/productos"
              className="flex items-center justify-center gap-3"
            >
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full border-2 border-white/40 bg-white/5 px-6 py-5 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-white/15 hover:text-white sm:w-auto sm:px-8 sm:py-6"
          >
            <a
              href="https://instagram.com/axe_percussao_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3"
            >
              <Instagram className="h-4 w-4" />
              @axe_percussao_
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Olas decorativas en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20">
        {/* Capa 1: ola trasera sutil (semitransparente) */}

        {/* Capa 2: ola media */}
        <svg
          viewBox="0 0 1440 180"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 h-20 w-full sm:h-24 md:h-32 lg:h-36"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100 C 240 150, 480 50, 720 110 S 1200 40, 1440 100 L1440 180 L0 180Z"
            style={{ fill: "var(--background)", opacity: 0.6 }}
          />
        </svg>

        {/* Capa 3: ola principal (sólida, hace el corte real) */}
        <svg
          viewBox="0 0 1440 180"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block h-16 w-full sm:h-20 md:h-28 lg:h-32"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80 C 160 140, 320 40, 480 90 C 640 140, 800 30, 960 80 C 1120 130, 1280 50, 1440 80 L1440 180 L0 180Z"
            style={{ fill: "var(--background)" }}
          />
        </svg>
      </div>
    </section>
  );
}
