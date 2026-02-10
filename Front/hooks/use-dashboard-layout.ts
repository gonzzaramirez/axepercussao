"use client"

import { useEffect, useState } from "react"

const DESKTOP_BREAKPOINT = 1024

type DashboardViewMode = "table" | "card"

export function useDashboardLayout() {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null)

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth)
    }

    updateViewportWidth()
    window.addEventListener("resize", updateViewportWidth)

    return () => {
      window.removeEventListener("resize", updateViewportWidth)
    }
  }, [])

  const isDesktop = viewportWidth !== null && viewportWidth >= DESKTOP_BREAKPOINT
  const viewMode: DashboardViewMode = isDesktop ? "table" : "card"

  return {
    isDesktop,
    viewMode,
  }
}
