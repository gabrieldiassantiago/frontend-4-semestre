import { getAuthToken } from "@/lib/auth/session"
import { ApiError } from "@/lib/errors"
import { API_BASE_URL } from "./config"

export { API_BASE_URL } from "./config"

export function getHeaders(): Record<string, string> {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    if (response.ok) throw new ApiError("O servidor retornou uma resposta inválida.", response.status)
  }
  if (!response.ok) {
    const message = data?.message || data?.error
    throw new ApiError(typeof message === "string" ? message : "Não foi possível concluir a solicitação.", response.status)
  }
  return data as T
}

export async function apiRequest<T = void>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(getHeaders())
  if (options.body instanceof FormData) headers.delete("Content-Type")
  new Headers(options.headers).forEach((value, key) => headers.set(key, value))
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  })
  return handleResponse<T>(response)
}
