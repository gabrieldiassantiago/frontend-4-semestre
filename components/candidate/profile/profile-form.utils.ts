import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

/** Normaliza o perfil vindo da API para o estado do formulário. */
export function toForm(profile: CandidateProfile): UpdateCandidateProfileDto {
  return {
    headline: profile.headline || "",
    summary: profile.summary || "",
    phone: profile.phone || "",
    city: profile.city || "",
    state: profile.state || "",
    institution: profile.institution || "",
    course: profile.course || "",
    currentSemester: profile.currentSemester || 0,
    expectedGraduationYear: profile.expectedGraduationYear || 0,
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
    portfolioUrl: profile.portfolioUrl || "",
    skills: profile.skills || [],
  }
}

const COMPLETION_FIELDS = [
  "headline",
  "summary",
  "phone",
  "city",
  "state",
  "institution",
  "course",
  "currentSemester",
  "expectedGraduationYear",
] as const

/** Percentual de preenchimento do perfil (0-100). */
export function getCompletion(form: UpdateCandidateProfileDto) {
  const values: unknown[] = [...COMPLETION_FIELDS.map((key) => form[key]), form.skills?.length]
  return Math.round((values.filter(Boolean).length / values.length) * 100)
}

/** Extrai mensagem de erro legível de uma exceção. */
export function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}
