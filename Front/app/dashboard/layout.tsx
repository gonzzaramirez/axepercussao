"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { checkAuth, logout } from "@/lib/api/auth"
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Ticket,
  DollarSign,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/productos", label: "Productos", icon: Package },
  { href: "/dashboard/categorias", label: "Categorías", icon: Tags },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/dashboard/descuentos", label: "Descuentos", icon: Ticket },
  { href: "/dashboard/precios", label: "Precios", icon: DollarSign },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === "/dashboard/login") {
      setLoading(false)
      return
    }

    checkAuth().then((result) => {
      if (!result.authenticated || result.user?.role !== "ADMIN") {
        router.push("/dashboard/login")
      } else {
        setLoading(false)
      }
    })
  }, [pathname, router])

  if (pathname === "/dashboard/login") {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800" />
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push("/dashboard/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-lg font-bold text-gray-900">Axé Percussão</h1>
            <p className="text-xs text-gray-500">Panel de administración</p>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h1 className="text-lg font-bold text-gray-900">Axé Percussão</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-sm text-gray-600"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-bold text-gray-900">Axé Percussão</h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
