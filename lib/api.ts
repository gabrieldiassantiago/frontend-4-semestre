const API_BASE_URL = 'http://localhost:8080'
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

// ── Candidate Profile Interfaces ──
export interface CandidateExperience {
  id: string
  companyName: string
  role: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  createdAt?: string
}

export interface CandidateProject {
  id: string
  title: string
  description?: string
  projectUrl?: string
  toolsAndSkills?: string[]
  createdAt?: string
}

export interface CandidateProfile {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  headline?: string
  summary?: string
  phone?: string
  city?: string
  state?: string
  institution?: string
  course?: string
  currentSemester?: number
  expectedGraduationYear?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills?: string[]
  experiences?: CandidateExperience[]
  projects?: CandidateProject[]
  createdAt?: string
  updatedAt?: string
}

export interface UpdateCandidateProfileDto {
  headline?: string
  summary?: string
  phone?: string
  city?: string
  state?: string
  institution?: string
  course?: string
  currentSemester?: number
  expectedGraduationYear?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  skills?: string[]
}

export interface CreateExperienceDto {
  companyName: string
  role: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
}

export interface CreateProjectDto {
  title: string
  description?: string
  projectUrl?: string
  toolsAndSkills?: string[]
}

// ── Company Profile Interfaces ──
export interface CompanyProfile {
  id: string
  userId: string
  companyName?: string
  cnpj?: string
  description?: string
  industry?: string
  website?: string
  city?: string
  state?: string
  logoUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateCompanyProfileDto {
  companyName?: string
  cnpj?: string
  description?: string
  industry?: string
  website?: string
  city?: string
  state?: string
  logoUrl?: string
}

// Salva o token via Cookie e armazena token em memória/helper se necessário
export function setAuthCookie(token: string, expiresIn?: number) {
  if (typeof document === "undefined") return
  const maxAge = expiresIn || 86400
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null
  const nameEQ = "token="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length)
  }
  return null
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = "Ocorreu um erro na requisição."
    try {
      const errorData = await res.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

// ── Auth Endpoints ──
export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function registerCompany(payload: CompanyRegistrationPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/register-company`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_BASE_URL}/auth`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  })
  const data = await handleResponse<AuthTokenResponse>(res)
  if (data.token) {
    setAuthCookie(data.token, data.expiresIn)
  }
  return data
}

export function getLinkedInAuthorizationUrl() {
  return `${API_BASE_URL}/oauth2/authorization/linkedin`
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function resendCode(payload: ResendCodePayload) {
  const res = await fetch(`${API_BASE_URL}/auth/resend-code`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

// ── Candidate Profile API ──
export async function getCandidateProfileMe(): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CandidateProfile>(res)
}

export async function updateCandidateProfileMe(dto: UpdateCandidateProfileDto): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidateProfile>(res)
}

export async function addCandidateExperience(dto: CreateExperienceDto): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/experiences`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidateProfile>(res)
}

export async function updateCandidateExperience(id: string, dto: CreateExperienceDto): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/experiences/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidateProfile>(res)
}

export async function deleteCandidateExperience(id: string): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/experiences/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CandidateProfile>(res)
}

export async function addCandidateProject(dto: CreateProjectDto): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/projects`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidateProfile>(res)
}

export async function updateCandidateProject(id: string, dto: CreateProjectDto): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/projects/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidateProfile>(res)
}

export async function deleteCandidateProject(id: string): Promise<CandidateProfile> {
  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/projects/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CandidateProfile>(res)
}

// ── Company Profile API ──
export async function getCompanyProfileMe(): Promise<CompanyProfile> {
  const res = await fetch(`${API_BASE_URL}/company-profile/me`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CompanyProfile>(res)
}

export async function uploadCandidateAvatar(file: File): Promise<CandidateProfile> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    credentials: "include",
    body: formData,
  })
  return handleResponse<CandidateProfile>(res)
}

export async function uploadCandidateResume(file: File): Promise<CandidateProfile> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE_URL}/candidate-profile/me/resume`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    credentials: "include",
    body: formData,
  })
  return handleResponse<CandidateProfile>(res)
}

export async function updateCompanyProfileMe(dto: UpdateCompanyProfileDto): Promise<CompanyProfile> {
  const res = await fetch(`${API_BASE_URL}/company-profile/me`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CompanyProfile>(res)
}
