import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="text-foreground">AXÉ</span>
          <span className="text-carnival-primary"> PERCUSSÃO</span>
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link href="/productos" className="transition-colors hover:text-foreground">
            Catálogo
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
