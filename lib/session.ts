/**
 * Helpers de sessão que rodam em qualquer runtime (proxy, servidor e browser).
 * Não validam a assinatura do JWT — isso é papel do backend. Servem apenas para
 * descobrir papel e expiração sem uma ida à API.
 */

export type SessionRole = "CANDIDATE" | "COMPANY"

export interface SessionClaims {
  role: SessionRole | null
  expiresAt: number | null
}

const EXPIRY_LEEWAY_MS = 10_000

export const CANDIDATE_ROUTE_PREFIXES = [
  "/profile",
  "/dashboard",
  "/candidaturas",
  "/vagas",
  "/visao-geral",
  "/mensagens",
  "/notificacoes",
  "/configuracoes",
]
export const COMPANY_ROUTE_PREFIXES = ["/empresa"]

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function isCandidatePath(pathname: string) {
  return matchesPrefix(pathname, CANDIDATE_ROUTE_PREFIXES)
}

export function isCompanyPath(pathname: string) {
  return matchesPrefix(pathname, COMPANY_ROUTE_PREFIXES)
}

export function isProtectedPath(pathname: string) {
  return isCandidatePath(pathname) || isCompanyPath(pathname)
}

function decodeBase64Url(segment: string) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Retorna `null` quando o token não é um JWT legível. */
export function readSessionClaims(token: string): SessionClaims | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const decoded = JSON.parse(decodeBase64Url(payload)) as { scope?: unknown; exp?: unknown }

    const role: SessionRole | null =
      decoded.scope === "COMPANY" ? "COMPANY" : decoded.scope === "CANDIDATE" ? "CANDIDATE" : null
    const expiresAt = typeof decoded.exp === "number" ? decoded.exp * 1000 : null

    return { role, expiresAt }
  } catch {
    return null
  }
}

export function isSessionExpired(claims: SessionClaims | null, now = Date.now()) {
  if (!claims) return true
  if (claims.expiresAt === null) return false
  return claims.expiresAt - EXPIRY_LEEWAY_MS <= now
}

/** URL de login preservando a página de origem e sinalizando sessão expirada. */
export function buildLoginRedirect(from: string, expired = true) {
  const params = new URLSearchParams({ from })
  if (expired) params.set("expired", "1")
  return `/auth?${params.toString()}`
}
