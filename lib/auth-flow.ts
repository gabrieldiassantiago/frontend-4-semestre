import { loginAction } from "@/actions/auth"
import { getCandidateProfileMeAction } from "@/actions/candidate"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { HOME_BY_ROLE, ROUTES } from "@/lib/config/routes"
import type { LoginPayload, UserRole } from "@/lib/types/auth.types"

// Credentials live only in memory until verification; never persist passwords.
let registration: LoginPayload | null = null

export function rememberRegistration(payload: LoginPayload) {
  registration = payload
}

export function profileDestination(role: UserRole) {
  return role === "COMPANY" ? ROUTES.company.profile : ROUTES.candidate.completeProfile
}

export async function finishRegistration(email: string, role: LoginPayload["role"]) {
  const credentials = registration
  registration = null
  if (!credentials || credentials.email !== email || credentials.role !== role) return false
  const result = await loginAction(credentials)
  return result.ok
}

export async function loginDestination(role: UserRole, setup = false) {
  if (setup) return profileDestination(role)
  if (role === "COMPANY") return HOME_BY_ROLE.COMPANY
  const result = await getCandidateProfileMeAction()
  if (!result.ok || !result.data) return profileDestination(role)
  return getProfileCompletion(result.data).ready ? HOME_BY_ROLE.CANDIDATE : profileDestination(role)
}
