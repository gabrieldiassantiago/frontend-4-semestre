import { ApiError } from "@/lib/errors"

/**
 * Envelope devolvido por toda Server Action.
 *
 * Server Actions não propagam instâncias de Error para o cliente em produção
 * (a mensagem é redigida). Por isso o erro viaja como dado serializável e é
 * reconvertido em `ApiError` no cliente com `unwrap`.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

//teste

export function fail<T = never>(error: string, status = 500): ActionResult<T> {
  return { ok: false, error, status }
}

/** Reconverte o envelope em valor ou lança `ApiError` (preserva o status HTTP). */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data
  throw new ApiError(result.error, result.status)
}
