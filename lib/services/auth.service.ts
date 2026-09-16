import { apiRequest, API_BASE_URL } from "@/lib/http/client"
import { setAuthCookie } from "@/lib/auth/session"
export { getAuthToken, setAuthCookie } from "@/lib/auth/session"
import type { RegisterPayload, CompanyRegistrationPayload, LoginPayload, VerifyEmailPayload, ResendCodePayload, AuthTokenResponse } from "@/lib/types/auth.types"

export async function registerUser(payload: RegisterPayload) {
  return apiRequest(`/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function registerCompany(payload: CompanyRegistrationPayload) {
  return apiRequest(`/auth/register-company`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokenResponse> {
  const data = await apiRequest<AuthTokenResponse>("/auth", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (data.token) {
    setAuthCookie(data.token, data.expiresIn)
  }
  return data
}

export function getLinkedInAuthorizationUrl() {
  return `${API_BASE_URL}/oauth2/authorization/linkedin`
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function resendCode(payload: ResendCodePayload) {
  return apiRequest(`/auth/resend-code`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
