/**
 * Re-exports das funções de autenticação do api.ts central.
 * Use este módulo para importações limpas dentro dos componentes.
 */
export {
  registerUser,
  registerCompany,
  loginUser,
  verifyEmail,
  resendCode,
  getLinkedInAuthorizationUrl,
  setAuthCookie,
  getAuthToken,
} from "@/lib/api"

export type {
  RegisterPayload,
  CompanyRegistrationPayload,
  LoginPayload,
  VerifyEmailPayload,
  ResendCodePayload,
  AuthTokenResponse,
  UserRole,
} from "@/lib/api"
