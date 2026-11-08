import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { API_BASE_URL } from "@/lib/http/config"
import {
  buildLoginRedirect,
  isCandidatePath,
  isCompanyPath,
  isSessionExpired,
  readSessionClaims,
} from "@/lib/session"

const AUTH_COOKIE = "token"
const REFRESH_COOKIE = "refresh_token"
const DEFAULT_SESSION_SECONDS = 86400
const REFRESH_SESSION_SECONDS = 7 * 24 * 60 * 60

const authRoutes = ["/auth", "/auth/candidato", "/auth/recrutador", "/auth/empresa"]
const candidateAuthRoutes = ["/auth/candidato"]
const companyAuthRoutes = ["/auth/empresa", "/auth/recrutador"]

interface RefreshResponse {
  tokenJwt?: string
  token?: string
  refreshToken?: string
  expiresInJwt?: number
  expiresIn?: number
}

async function refreshInMiddleware(refreshToken: string): Promise<RefreshResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const rawToken = request.cookies.get(AUTH_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const { pathname, search } = request.nextUrl

  let claims = rawToken ? readSessionClaims(rawToken) : null
  let hasStaleToken = Boolean(rawToken) && isSessionExpired(claims)
  let token = hasStaleToken ? undefined : rawToken

  let refreshedTokens: RefreshResponse | null = null

  if (!token && refreshToken) {
    refreshedTokens = await refreshInMiddleware(refreshToken)
    const newJwt = refreshedTokens?.tokenJwt ?? refreshedTokens?.token

    if (newJwt) {
      token = newJwt
      claims = readSessionClaims(newJwt)
      hasStaleToken = false
      request.cookies.set(AUTH_COOKIE, newJwt)
    } else {
      hasStaleToken = true
    }
  }

  const role = claims?.role ?? null

  const isCandidateRoute = isCandidatePath(pathname)
  const isCompanyRoute = isCompanyPath(pathname)
  const isProtectedRoute = isCandidateRoute || isCompanyRoute
  const isAuthRoute = authRoutes.includes(pathname)

  // Função auxiliar para anexar os novos cookies (ou limpar os vencidos) em qualquer resposta
  const applyCookies = (res: NextResponse) => {
    const newJwt = refreshedTokens?.tokenJwt ?? refreshedTokens?.token
    if (newJwt) {
      const isProd = process.env.NODE_ENV === "production"
      res.cookies.set(AUTH_COOKIE, newJwt, {
        httpOnly: false,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: refreshedTokens?.expiresInJwt ?? refreshedTokens?.expiresIn ?? DEFAULT_SESSION_SECONDS,
      })
      if (refreshedTokens?.refreshToken) {
        res.cookies.set(REFRESH_COOKIE, refreshedTokens.refreshToken, {
          httpOnly: false,
          sameSite: "lax",
          secure: isProd,
          path: "/",
          maxAge: REFRESH_SESSION_SECONDS,
        })
      }
    } else if (hasStaleToken) {
      res.cookies.delete(AUTH_COOKIE)
      res.cookies.delete(REFRESH_COOKIE)
    }
    return res
  }

  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(
      new URL(buildLoginRedirect(`${pathname}${search}`, hasStaleToken), request.url),
    )
    return applyCookies(response)
  }

  if (token && isCompanyRoute && role !== "COMPANY") {
    return applyCookies(NextResponse.redirect(new URL("/acesso-negado", request.url)))
  }

  if (token && isCandidateRoute && role !== "CANDIDATE") {
    return applyCookies(NextResponse.redirect(new URL("/acesso-negado", request.url)))
  }

  if (isAuthRoute && token) {
    if (candidateAuthRoutes.includes(pathname) && role !== "CANDIDATE") {
      return applyCookies(NextResponse.redirect(new URL("/acesso-negado", request.url)))
    }
    if (companyAuthRoutes.includes(pathname) && role !== "COMPANY") {
      return applyCookies(NextResponse.redirect(new URL("/acesso-negado", request.url)))
    }
    return applyCookies(
      NextResponse.redirect(
        new URL(role === "COMPANY" ? "/empresa/dashboard" : "/dashboard", request.url),
      ),
    )
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  })
  return applyCookies(response)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.zip$).*)"],
}
