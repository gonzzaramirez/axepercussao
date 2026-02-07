import { Instagram, Facebook, Mail, Phone } from "lucide-react"

const links = [
  {
    href: "https://instagram.com/axe_percussao_",
    label: "Instagram",
    icon: Instagram,
    value: "@axe_percussao_",
  },
  {
    href: "https://facebook.com/axepercussao",
    label: "Facebook",
    icon: Facebook,
    value: "Axe Percussão",
  },
  {
    href: "mailto:contacto@axepercussao.com",
    label: "Email",
    icon: Mail,
    value: "contacto@axepercussao.com",
  },
  {
    href: "tel:+5491100000000",
    label: "Teléfono",
    icon: Phone,
    value: "+54 9 11 0000-0000",
  },
]

export function ContactSection() {
  return (
    <section id="contacto" className="border-t border-border bg-muted/30 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Contacto
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 lg:gap-12">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 text-foreground transition-colors hover:text-carnival-primary"
                aria-label={item.label}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-muted-foreground transition-colors hover:border-carnival-primary/30 hover:text-carnival-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium sm:text-base">{item.value}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
