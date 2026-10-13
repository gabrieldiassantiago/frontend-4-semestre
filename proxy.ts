import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const candidateRoutes = ["/profile", "/dashboard", "/candidaturas", "/vagas"]
const companyRoutes = ["/empresa"]
const protectedRoutes = [...candidateRoutes, ...companyRoutes]

const authRoutes = ["/auth", "/auth/candidato", "/auth/recrutador", "/auth/empresa"]
const candidateAuthRoutes = ["/auth/candidato"]
const companyAuthRoutes = ["/auth/empresa", "/auth/recrutador"]

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl
  const role = token ? readRoleFromToken(token) : null

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isCandidateRoute = candidateRoutes.some((route) => pathname.startsWith(route))
  const isCompanyRoute = companyRoutes.some((route) => pathname.startsWith(route))

  if (token && isCompanyRoute && role !== "COMPANY") {
    return NextResponse.redirect(new URL("/acesso-negado", request.url))
  }

  if (token && isCandidateRoute && role !== "CANDIDATE") {
    return NextResponse.redirect(new URL("/acesso-negado", request.url))
  }

  if (isAuthRoute && token) {
    if (candidateAuthRoutes.includes(pathname) && role !== "CANDIDATE") {
      return NextResponse.redirect(new URL("/acesso-negado", request.url))
    }
    if (companyAuthRoutes.includes(pathname) && role !== "COMPANY") {
      return NextResponse.redirect(new URL("/acesso-negado", request.url))
    }
    return NextResponse.redirect(new URL(role === "COMPANY" ? "/empresa/dashboard" : "/dashboard", request.url))
  }

  return NextResponse.next()
}

function readRoleFromToken(token: string): "CANDIDATE" | "COMPANY" | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(atob(normalized)) as { scope?: string }
    return decoded.scope === "COMPANY" ? "COMPANY" : decoded.scope === "CANDIDATE" ? "CANDIDATE" : null
  } catch {
    return null
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.zip$).*)"],
}
