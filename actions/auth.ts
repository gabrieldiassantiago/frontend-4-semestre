"use server"

import { cookies } from "next/headers"
import { apiFetch, AUTH_COOKIE, getServerToken } from "@/lib/server/api"
import { fail, ok, type ActionResult } from "@/lib/actions/result"
import type {
  UserRole,
  AuthTokenResponse,
  CompanyRegistrationPayload,
  LoginPayload,
  RegisterPayload,
  ResendCodePayload,
  VerifyEmailPayload,
  CurrentUser,
} from "@/lib/types/auth.types"

const DEFAULT_SESSION_SECONDS = 86400

export async function registerUserAction(payload: RegisterPayload): Promise<ActionResult<void>> {
  return apiFetch<void>("/users", { method: "POST", body: payload })
}

export async function registerCompanyAction(payload: CompanyRegistrationPayload): Promise<ActionResult<void>> {
  return apiFetch<void>("/auth/register-company", { method: "POST", body: payload })
}

export interface LoginResult {
  role: AuthTokenResponse["role"]
  expiresIn?: number
}

/** Autentica e grava o JWT em cookie httpOnly — o token nunca chega ao JavaScript do navegador. */
export async function loginAction(payload: LoginPayload): Promise<ActionResult<LoginResult>> {
  const result = await apiFetch<AuthTokenResponse>("/auth", { method: "POST", body: payload })
  if (!result.ok) return result
  if (!result.data?.token) return fail("Resposta de autenticação inválida.", 502)

  const store = await cookies()
  store.set(AUTH_COOKIE, result.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: result.data.expiresIn || DEFAULT_SESSION_SECONDS,
  })

  return ok({ role: result.data.role, expiresIn: result.data.expiresIn })
}

export async function logoutAction(): Promise<ActionResult<void>> {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
  return ok(undefined)
}

export async function getCurrentUserAction(): Promise<ActionResult<CurrentUser>> {
  const token = await getServerToken()
  if (!token) return fail("Não autenticado.", 401)

  let jwtPayload: Record<string, unknown> = {}
  try {
    const parts = token.split(".")
    if (parts.length === 3) {
      jwtPayload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"))
    }
  } catch {}

  const candidateUserId = (jwtPayload.id as string) || (jwtPayload.userId as string) || (typeof jwtPayload.sub === "string" && !jwtPayload.sub.includes("@") ? jwtPayload.sub : undefined)

  // Se o JWT tiver o id do usuário, tenta buscar /users/{id}
  if (candidateUserId && candidateUserId !== "me") {
    const userRes = await apiFetch<CurrentUser>(`/users/${encodeURIComponent(candidateUserId)}`)
    if (userRes.ok && userRes.data) {
      return userRes
    }
  }

  // Tenta obter pelo perfil do candidato (que já traz userName e userEmail)
  const candRes = await apiFetch<{ userName?: string; userEmail?: string; userId?: string }>("/candidate-profile/me", { nullOn: [404] })
  if (candRes.ok && candRes.data && (candRes.data.userName || candRes.data.userEmail)) {
    return ok({
      id: candRes.data.userId || candidateUserId || "user",
      name: candRes.data.userName || "Usuário",
      email: candRes.data.userEmail || "",
      role: (jwtPayload.role as UserRole) || "CANDIDATE",
      active: true,
    })
  }

  // Tenta obter pelo perfil da empresa
  const compRes = await apiFetch<{ companyName?: string; responsibleName?: string; email?: string; userId?: string }>("/company-profile/me", { nullOn: [404] })
  if (compRes.ok && compRes.data) {
    return ok({
      id: compRes.data.userId || candidateUserId || "user",
      name: compRes.data.responsibleName || compRes.data.companyName || "Empresa",
      email: compRes.data.email || "",
      role: "COMPANY",
      active: true,
    })
  }

  if (jwtPayload.name || jwtPayload.email || jwtPayload.sub) {
    return ok({
      id: candidateUserId || "user",
      name: (jwtPayload.name as string) || "Usuário",
      email: (jwtPayload.email as string) || (typeof jwtPayload.sub === "string" && jwtPayload.sub.includes("@") ? jwtPayload.sub : ""),
      role: (jwtPayload.role as UserRole) || "CANDIDATE",
      active: true,
    })
  }

  return fail("Não foi possível carregar os dados do usuário.", 404)
}

export async function verifyEmailAction(payload: VerifyEmailPayload): Promise<ActionResult<void>> {
  return apiFetch<void>("/auth/verify-email", { method: "POST", body: payload })
}

export async function resendCodeAction(payload: ResendCodePayload): Promise<ActionResult<void>> {
  return apiFetch<void>("/auth/resend-code", { method: "POST", body: payload })
}
