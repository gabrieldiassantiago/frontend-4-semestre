export type UserRole = "CANDIDATE" | "COMPANY" | "ADMIN"

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface CompanyRegistrationPayload {
  responsibleName: string
  email: string
  password: string
  companyName: string
  cnpj: string
  industry: string
  website?: string
  city: string
  state: string
  description?: string
}

export interface LoginPayload {
  email: string
  password: string
  role: Exclude<UserRole, "ADMIN">
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface ResendCodePayload {
  email: string
}

export interface AuthTokenResponse {
  token: string
  expiresIn?: number
  role: UserRole
}
