import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

export const PROFILE_STEPS = [
  {
    id: "basico",
    label: "Sobre você",
    title: "Vamos começar pelo básico",
    description: "É assim que as empresas vão te identificar nos processos seletivos.",
  },
  {
    id: "localizacao",
    label: "Localização",
    title: "Onde você quer encontrar oportunidades",
    description: "Use sua cidade para receber vagas mais próximas e relevantes.",
  },
  {
    id: "formacao",
    label: "Formação",
    title: "Sua formação acadêmica",
    description: "Ajuda a empresa a entender o seu momento de carreira.",
  },
  {
    id: "skills",
    label: "Habilidades",
    title: "O que você sabe fazer",
    description: "Habilidades técnicas e comportamentais que você quer destacar.",
  },
  {
    id: "links",
    label: "Links",
    title: "Onde conhecer melhor seu trabalho",
    description: "Compartilhe um perfil profissional, portfólio ou página com exemplos do seu trabalho. É opcional.",
  },
  {
    id: "curriculo",
    label: "Currículo",
    title: "Seu currículo, do seu jeito",
    description: "Anexe um PDF e confira como ele será apresentado. Esta etapa é opcional.",
  },
  {
    id: "experiencias",
    label: "Experiências",
    title: "Onde você já trabalhou",
    description: "Estágios, trabalhos formais, voluntariado e projetos acadêmicos contam.",
  },
  {
    id: "projetos",
    label: "Projetos",
    title: "Projetos que contam sua história",
    description: "Inclua iniciativas do trabalho, dos estudos ou da comunidade. O que você fez e qual foi sua contribuição?",
  },
  {
    id: "revisao",
    label: "Revisão",
    title: "Confira antes de finalizar",
    description: "É exatamente isso que a empresa vai ver quando você se candidatar.",
  },
] as const

export type ProfileStepId = (typeof PROFILE_STEPS)[number]["id"]

export const PROFILE_STEP_IDS = PROFILE_STEPS.map((step) => step.id)

export interface ChecklistItem {
  id: string
  label: string
  step: ProfileStepId
  done: boolean
  required: boolean
}

function filled(value?: string | null) {
  return Boolean(value && value.trim())
}

export function getProfileChecklist(
  profile: (UpdateCandidateProfileDto & Partial<CandidateProfile>) | null | undefined,
): ChecklistItem[] {
  const data = profile ?? {}
  const skills = data.skills ?? []
  const experiences = data.experiences ?? []
  const projects = data.projects ?? []

  return [
    { id: "resume", label: "Currículo em PDF", step: "curriculo", required: false, done: filled(data.resumeUrl) },
    {
      id: "headline",
      label: "Título profissional",
      step: "basico",
      required: true,
      done: filled(data.headline),
    },
    {
      id: "summary",
      label: "Resumo sobre você",
      step: "basico",
      required: true,
      done: filled(data.summary),
    },
    {
      id: "phone",
      label: "Telefone de contato",
      step: "basico",
      required: true,
      done: filled(data.phone),
    },
    {
      id: "location",
      label: "Cidade e estado",
      step: "localizacao",
      required: true,
      done: filled(data.city) && filled(data.state),
    },
    {
      id: "institution",
      label: "Instituição de ensino",
      step: "formacao",
      required: true,
      done: filled(data.institution),
    },
    {
      id: "course",
      label: "Curso",
      step: "formacao",
      required: true,
      done: filled(data.course),
    },
    {
      id: "semester",
      label: "Semestre atual",
      step: "formacao",
      required: false,
      done: Boolean(data.currentSemester),
    },
    {
      id: "graduation",
      label: "Previsão de formatura",
      step: "formacao",
      required: false,
      done: Boolean(data.expectedGraduationYear),
    },
    {
      id: "skills",
      label: "Pelo menos 3 habilidades",
      step: "skills",
      required: true,
      done: skills.length >= 3,
    },
    {
      id: "links",
      label: "Um link profissional",
      step: "links",
      required: false,
      done: filled(data.linkedinUrl) || filled(data.githubUrl) || filled(data.portfolioUrl),
    },
    {
      id: "experiences",
      label: "Uma experiência",
      step: "experiencias",
      required: false,
      done: experiences.length > 0,
    },
    {
      id: "projects",
      label: "Um projeto",
      step: "projetos",
      required: false,
      done: projects.length > 0,
    },
  ]
}

export interface ProfileCompletion {
  /** Percentual de 0 a 100 considerando itens obrigatórios e opcionais. */
  value: number
  items: ChecklistItem[]
  missing: ChecklistItem[]
  missingRequired: ChecklistItem[]
  ready: boolean
  complete: boolean
}

export function getProfileCompletion(
  profile: (UpdateCandidateProfileDto & Partial<CandidateProfile>) | null | undefined,
): ProfileCompletion {
  const items = getProfileChecklist(profile)
  const done = items.filter((item) => item.done)
  const missing = items.filter((item) => !item.done)
  const missingRequired = missing.filter((item) => item.required)

  return {
    value: Math.round((done.length / items.length) * 100),
    items,
    missing,
    missingRequired,
    ready: missingRequired.length === 0,
    complete: missing.length === 0,
  }
}

export function stepsComPendencia(completion: ProfileCompletion): ProfileStepId[] {
  return Array.from(new Set(completion.missing.map((item) => item.step)))
}
