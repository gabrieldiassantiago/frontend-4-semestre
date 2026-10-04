import "server-only"

import { cookies } from "next/headers"
import { API_BASE_URL } from "@/lib/http/config"
import { fail, ok, type ActionResult } from "@/lib/actions/result"

export const AUTH_COOKIE = "token"

/** No servidor, `API_URL` (rede interna/Docker) tem prioridade sobre a URL pública. */
const SERVER_API_URL = (process.env.API_URL || API_BASE_URL).replace(/\/+$/, "")

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Status HTTP que devem ser devolvidos como `ok(null)` em vez de erro (ex.: 404 = "sem perfil"). */
  nullOn?: number[]
}

export async function getServerToken() {
  const store = await cookies()
  return store.get(AUTH_COOKIE)?.value ?? null
}

/**
 * Único ponto de contato do servidor Next com a API Java.
 * Lê o JWT do cookie httpOnly, serializa o corpo e normaliza a resposta em `ActionResult`.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<ActionResult<T>> {
  const { body, nullOn = [], headers: extraHeaders, ...init } = options
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
    response = await fetch(`${SERVER_API_URL}${path}`, { ...init, headers, body: payload, cache: "no-store" })
  } catch {
    return fail("Não foi possível conectar ao servidor.", 503)
  }

  if (nullOn.includes(response.status)) return ok(null as T)

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
    return fail(
      typeof message === "string" && message ? message : "Não foi possível concluir a solicitação.",
      response.status,
    )
  }

  return ok(data as T)
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ""
}
