import type { CreateExperienceDto, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

const DDDS = new Set("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "))

export function phoneDigits(value: string) {
  const digits = value.replace(/\D/g, "")
  return digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits
}

export function formatPhone(value: string) {
  const digits = phoneDigits(value).slice(0, 11)
  if (!digits) return ""
  if (digits.length <= 2) return "(" + digits
  const split = digits.length > 10 ? 7 : 6
  return "(" + digits.slice(0, 2) + ") " + digits.slice(2, split) + (digits.length > split ? "-" + digits.slice(split) : "")
}

export function phoneError(value: string) {
  const digits = phoneDigits(value)
  if (!DDDS.has(digits.slice(0, 2)) || !/^(?:\d{2}[2-5]\d{7}|\d{2}9\d{8})$/.test(digits) || /^(\d)\1+$/.test(digits.slice(2))) {
    return "Informe um telefone válido com DDD, como (11) 91234-5678."
  }
}

export function isWebUrl(value: string) {
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname)
  } catch { return false }
}

export function validateProfile(data: UpdateCandidateProfileDto, step?: string, requireFields = false) {
  const errors: Partial<Record<keyof UpdateCandidateProfileDto, string>> = {}
  const required = (key: "headline" | "summary" | "phone" | "institution" | "course", message: string) => {
    if (requireFields && !data[key]?.trim()) errors[key] = message
  }
  if (!step || step === "basico") {
    required("headline", "Informe seu título profissional.")
    required("summary", "Conte um pouco sobre você.")
    required("phone", "Informe seu telefone de contato.")
    if (data.phone?.trim()) errors.phone = phoneError(data.phone)
  }
  if (!step || step === "formacao") {
    required("institution", "Informe sua instituição de ensino.")
    required("course", "Informe seu curso.")
    const semester = data.currentSemester
    if ((requireFields && semester == null) || (semester != null && (!Number.isInteger(semester) || semester < 1 || semester > 20))) errors.currentSemester = "Escolha um semestre entre 1 e 20."
    const year = data.expectedGraduationYear
    const currentYear = new Date().getFullYear()
    if ((requireFields && year == null) || (year != null && (!Number.isInteger(year) || year < currentYear || year > currentYear + 10))) errors.expectedGraduationYear = "Escolha um ano entre " + currentYear + " e " + (currentYear + 10) + "."
  }
  for (const key of ["linkedinUrl", "githubUrl", "portfolioUrl"] as const) {
    if ((!step || step === "links") && data[key]?.trim() && !isWebUrl(data[key]!.trim())) errors[key] = "Informe um link completo começando com https://."
  }
  return Object.fromEntries(Object.entries(errors).filter(([, error]) => error)) as typeof errors
}

export function validateExperience(data: CreateExperienceDto, currentMonth: string) {
  const errors: Record<string, string> = {}
  const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && value >= "1900-01" && value <= currentMonth
  if (!data.companyName.trim()) errors.companyName = "Informe a empresa ou organização."
  if (!data.role.trim()) errors.role = "Informe o cargo ou a atividade."
  if (!validMonth(data.startDate)) errors.startDate = "Informe um mês de início válido, até o mês atual."
  if (!data.isCurrent) {
    if (!data.endDate || !validMonth(data.endDate)) errors.endDate = "Informe o término ou marque que ainda trabalha aqui."
    else if (data.endDate < data.startDate) errors.endDate = "O término deve ser igual ou posterior ao início."
  }
  return errors
}
