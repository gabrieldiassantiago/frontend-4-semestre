import { ApiError } from "@/lib/errors"

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}
export function fail<T = never>(error: string, status = 500): ActionResult<T> {
  return { ok: false, error, status }
}

export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data
  throw new ApiError(result.error, result.status)
}
