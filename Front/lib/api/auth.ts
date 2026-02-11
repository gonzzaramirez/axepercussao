import type { User } from "@/types"
import { API_URL } from "@/lib/api/config"

export async function login(
  email: string,
  password: string
): Promise<{ user: User }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Credenciales inválidas")
  }
  return res.json()
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}

export async function refreshToken(): Promise<{ authenticated: boolean }> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) return { authenticated: false }
  return res.json()
}

export async function checkAuth(): Promise<{
  authenticated: boolean
  user: User | null
}> {
  try {
    const res = await fetch(`${API_URL}/auth/check`, {
      credentials: "include",
    })
    if (!res.ok) return { authenticated: false, user: null }
    return res.json()
  } catch {
    return { authenticated: false, user: null }
  }
}

export async function getProfile(): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("No autenticado")
  return res.json()
}
