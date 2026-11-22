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

  profileImageUrl?: string
  resumeUrl?: string

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
  certificates?: CandidateCertificate[]
  languages?: CandidateLanguage[]
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

export interface CreateProfileDto extends UpdateCandidateProfileDto {
  experiences?: CreateExperienceDto[]
  projects?: CreateProjectDto[]
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

export interface CandidateCertificate {
  id: string
  name: string
  issuer: string
  /** YYYY-MM-DD */
  issueDate: string
  credentialUrl?: string | null
  /** Caminho relativo à API; exige JWT (baixar pela rota /api/anexos). */
  fileUrl?: string | null
  fileName?: string | null
  fileContentType?: string | null
  createdAt?: string
}

export interface CreateCertificateDto {
  name: string
  issuer: string
  issueDate: string
  credentialUrl?: string | null
}

export type LanguageProficiency = "BASICO" | "INTERMEDIARIO" | "AVANCADO" | "FLUENTE" | "NATIVO"

export interface CandidateLanguage {
  id: string
  language: string
  proficiency: LanguageProficiency
  certificateUrl?: string | null
  certificateFileName?: string | null
  certificateContentType?: string | null
  createdAt?: string
}

export interface CreateLanguageDto {
  language: string
  proficiency: LanguageProficiency
}
