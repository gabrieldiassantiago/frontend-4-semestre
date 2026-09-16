import { loginUser } from "@/lib/services/auth.service"
import { getCandidateProfileMe } from "@/lib/services/candidate.service"
import { getProfileCompletion } from "@/lib/candidate-completion"
import type { LoginPayload, UserRole } from "@/lib/types/auth.types"

// Credentials live only in memory until verification; never persist passwords.
let registration: LoginPayload | null = null

export function rememberRegistration(payload: LoginPayload) {
  registration = payload
}

export function profileDestination(role: UserRole) {
  return role === "COMPANY" ? "/empresa/perfil" : "/profile/candidato/completar"
}

export async function finishRegistration(email: string, role: LoginPayload["role"]) {
  const credentials = registration
  registration = null
  if (!credentials || credentials.email !== email || credentials.role !== role) return false
  try {
    const response = await loginUser(credentials)
    return Boolean(response.token)
  } catch {
    return false
  }
}

export async function loginDestination(role: UserRole, setup = false) {
  if (setup) return profileDestination(role)
  if (role === "COMPANY") return "/empresa/dashboard"
  try {
    const profile = await getCandidateProfileMe()
    return getProfileCompletion(profile).ready ? "/dashboard" : profileDestination(role)
  } catch {
    return profileDestination(role)
  }
}
