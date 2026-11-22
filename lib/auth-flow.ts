import { loginAction } from "@/actions/auth"
import { HOME_BY_ROLE, ROUTES, WELCOME_PARAM } from "@/lib/config/routes"
import type { LoginPayload, UserRole } from "@/lib/types/auth.types"

let registration: LoginPayload | null = null

export function rememberRegistration(payload: LoginPayload) {
  registration = payload
}

/**
 * Para onde mandar a conta para montar o perfil.
 * `welcome` marca um candidato recém-criado, que vê as boas-vindas antes do wizard.
 */
export function profileDestination(role: UserRole, welcome = false) {
  if (role === "COMPANY") return ROUTES.company.profile
  return welcome
    ? `${ROUTES.candidate.completeProfile}?${WELCOME_PARAM}=1`
    : ROUTES.candidate.completeProfile
}

export async function finishRegistration(email: string, role: LoginPayload["role"]) {
  const credentials = registration
  registration = null
  if (!credentials || credentials.email !== email || credentials.role !== role) return false
  const result = await loginAction(credentials)
  return result.ok
}

/**
 * Destino após um login comum.
 * O wizard só é aberto à força no primeiro acesso (`setup`, ou a flag de conta nova
 * no login social). Nos logins seguintes o candidato vai para o início, mesmo com o
 * perfil incompleto: o card "Seu perfil" do dashboard e o modal de candidatura já
 * lembram o que falta, sem bloquear a entrada a cada login.
 */
export async function loginDestination(role: UserRole, setup = false) {
  if (setup) return profileDestination(role)
  return role === "COMPANY" ? HOME_BY_ROLE.COMPANY : HOME_BY_ROLE.CANDIDATE
}
