import "server-only"

import { cookies } from "next/headers"
import { API_BASE_URL } from "@/lib/http/config"
import { fail, ok, type ActionResult } from "@/lib/actions/result"
import type { AuthTokenResponse } from "@/lib/types/auth.types"

export const AUTH_COOKIE = "token"
export const REFRESH_COOKIE = "refresh_token"

export const DEFAULT_SESSION_SECONDS = 86400
export const REFRESH_SESSION_SECONDS = 7 * 24 * 60 * 60 // 7 dias (igual ao backend)

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  nullOn?: number[]
  _isRetry?: boolean // Evita loop infinito de refresh
}

export async function getServerToken() {
  const store = await cookies()
  return store.get(AUTH_COOKIE)?.value ?? null
}

export async function getServerRefreshToken() {
  const store = await cookies()
  return store.get(REFRESH_COOKIE)?.value ?? null
}

export async function setAuthCookies(tokenJwt: string, refreshToken?: string, expiresIn?: number) {
  try {
    const store = await cookies()
    const isProd = process.env.NODE_ENV === "production"

    store.set(AUTH_COOKIE, tokenJwt, {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: expiresIn || DEFAULT_SESSION_SECONDS,
    })

    if (refreshToken) {
      store.set(REFRESH_COOKIE, refreshToken, {
        httpOnly: false, // Pode ser true se o client-side não precisar ler diretamente
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: REFRESH_SESSION_SECONDS,
      })
    }
  } catch {
    // Ignorado quando chamado dentro de Server Components (o Middleware cuidará disso)
  }
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = await getServerRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })

    if (!response.ok) return null

    const data = (await response.json()) as AuthTokenResponse
    const newJwt = data.tokenJwt ?? data.tokenJwt
    const newRefresh = data.refreshToken
    const expiresIn = data.expiresInJwt ?? data.expiresInJwt

    if (!newJwt) return null

    await setAuthCookies(newJwt, newRefresh, expiresIn)
    return newJwt
  } catch {
    return null
  }
}

export async function fetchPrivateResume(userId: string, file: string) {
  const url = API_BASE_URL + "/candidate-profile/" + userId + "/resume/" + file
  const request = (token: string) => fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
    cache: "no-store",
    redirect: "error",
  })
  const token = await getServerToken()
  if (token) {
    const response = await request(token)
    if (response.status !== 401) return response
  }
  const renewed = await tryRefreshToken()
  return renewed ? request(renewed) : new Response(null, { status: 401 })
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<ActionResult<T>> {
  const { body, nullOn = [], headers: extraHeaders, _isRetry = false, ...init } = options
  const token = await getServerToken()

  const headers = new Headers(extraHeaders)
  headers.set("Accept", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json")
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`,{ ...init, headers, body: payload, cache: "no-store" })
  } catch {
    return fail("Não foi possível conectar ao servidor.", 503)
  }

  if (nullOn.includes(response.status)) return ok(null as T)

  const isAuthEndpoint = path === "/auth" || path.startsWith("/auth/refresh-token")
  if (response.status === 401 && !_isRetry && !isAuthEndpoint) {
    const newToken = await tryRefreshToken()
    if (newToken) {

      const retryHeaders = new Headers(extraHeaders)
      retryHeaders.set("Accept", "application/json")
      retryHeaders.set("Authorization", `Bearer ${newToken}`)
      return apiFetch<T>(path, { ...options, headers: retryHeaders, _isRetry: true })
    
    }

    await clearExpiredSession()
    return fail("Sua sessão expirou. Entre novamente.", 401)
  }

  const text = await response.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    if (response.ok) return fail("O servidor retornou uma resposta inválida.", response.status)
  }

  if (!response.ok) {
    const record = (data ?? {}) as { message?: unknown; error?: unknown }
    const message = record.message ?? record.error
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[api] ${init.method ?? "GET"} ${path} -> ${response.status}`, message ?? "")
    }
    return fail(
      typeof message === "string" && message ? message : "Não foi possível concluir a solicitação.",
      response.status,
    )
  }

  return ok(data as T)
}

/** Remove os cookies quando a sessão e o refresh expiram. */
async function clearExpiredSession() {
  try {
    const store = await cookies()
    store.delete(AUTH_COOKIE)
    store.delete(REFRESH_COOKIE)
  } catch {
    // Server Components não podem alterar cookies; o proxy limpa na próxima navegação.
  }
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ""
}
