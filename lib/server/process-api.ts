import "server-only"
import { apiFetch } from "./api"
import { normalizarProcesso } from "@/lib/utils/processo"

export async function processApiFetch<T>(...args: Parameters<typeof apiFetch>) {
  const result = await apiFetch<T>(...args)
  return result.ok ? { ...result, data: normalizarProcesso(result.data) } : result
}
