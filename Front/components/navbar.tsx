"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

const navLinks = [
  { href: "/#destacados", label: "Destacados" },
  { href: "/productos", label: "Productos" },
  { href: "/#contacto", label: "Contacto" },
]

function isActiveLink(pathname: string, href: string) {
  if (href === "/productos") return pathname === "/productos"
  if (href === "/#destacados") return pathname === "/"
  if (href === "/#contacto") return pathname === "/"
  return pathname === href
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { totalItems, setIsOpen: setCartOpen } = useCart()

  useEffect(() => {
    setIsMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const linkStyle = (href: string) =>
    cn(
      "text-sm font-semibold transition-colors",
      scrolled
        ? "text-foreground hover:text-foreground"
        : isActiveLink(pathname, href)
          ? "text-carnival-primary drop-shadow-md"
          : "text-white drop-shadow-sm hover:text-white"
    )

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/80 shadow-lg backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5"
          aria-label="Axé Percussão - Inicio"
        >
          <span
            className={cn(
              "font-display text-xl tracking-tight transition-colors sm:text-2xl",
              scrolled ? "text-foreground" : "text-white drop-shadow-sm"
            )}
          >
            AXÉ
          </span>
          <span
            className={cn(
              "font-display text-xl tracking-tight text-carnival-primary sm:text-2xl",
              !scrolled && "drop-shadow-md"
            )}
          >
            PERCUSSÃO
          </span>
        </Link>

        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkStyle(link.href)}
              onClick={link.href.startsWith("/#") ? () => {} : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={() => setCartOpen(true)}
            variant="outline"
            size="icon"
            className={cn(
              "relative h-9 w-9 rounded-full",
              scrolled
                ? "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                : "border-white/30 bg-white/15 text-white backdrop-blur-sm drop-shadow-sm hover:bg-white/25"
            )}
            aria-label="Abrir carrito de compras"
          >
            <ShoppingCart className="h-4 w-4" />
            {isMounted && totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-carnival-primary text-xs font-bold leading-none text-white">
                {totalItems}
              </span>
            )}
          </Button>

          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full md:hidden",
              scrolled
                ? "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                : "border-white/30 bg-white/15 text-white backdrop-blur-sm drop-shadow-sm hover:bg-white/25"
            )}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border/80 bg-background/80 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-0.5 px-4 py-3" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActiveLink(pathname, link.href)
                      ? "bg-carnival-primary/10 text-carnival-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
