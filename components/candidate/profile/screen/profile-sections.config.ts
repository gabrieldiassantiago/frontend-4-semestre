import {
  BriefcaseBusiness,
  Code2,
  Eye,
  FileText,
  GraduationCap,
  Link2,
  Sparkles,
  UserRound,
} from "lucide-react"
import type { ProfileStepId } from "@/lib/candidate-completion"
import type { UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

/**
 * Seções da tela de perfil. `steps` liga cada seção às etapas do checklist,
 * para que as pendências levem a pessoa direto ao lugar certo.
 */
export const PROFILE_SECTIONS = [
  {
    id: "basico",
    label: "Sobre você",
    description: "Foto, título, resumo, contato e localização.",
    icon: UserRound,
    editable: true,
    steps: ["basico", "localizacao"],
  },
  {
    id: "formacao",
    label: "Formação",
    description: "Instituição, curso e previsão de formatura.",
    icon: GraduationCap,
    editable: true,
    steps: ["formacao"],
  },
  {
    id: "skills",
    label: "Habilidades",
    description: "Competências técnicas e comportamentais.",
    icon: Sparkles,
    editable: true,
    steps: ["skills"],
  },
  {
    id: "links",
    label: "Links",
    description: "Portfólio, LinkedIn e outras páginas públicas.",
    icon: Link2,
    editable: true,
    steps: ["links"],
  },
  {
    id: "curriculo",
    label: "Currículo",
    description: "Seu currículo em PDF. Salvo automaticamente.",
    icon: FileText,
    editable: false,
    steps: ["curriculo"],
  },
  {
    id: "experiencias",
    label: "Experiências",
    description: "Trabalhos, estágios e voluntariado. Cada item é salvo ao confirmar.",
    icon: BriefcaseBusiness,
    editable: false,
    steps: ["experiencias"],
  },
  {
    id: "projetos",
    label: "Projetos",
    description: "Iniciativas que mostram sua contribuição. Cada item é salvo ao confirmar.",
    icon: Code2,
    editable: false,
    steps: ["projetos"],
  },
  {
    id: "preview",
    label: "Visualizar",
    description: "Exatamente o que a empresa vê quando você se candidata.",
    icon: Eye,
    editable: false,
    steps: [],
  },
] as const satisfies readonly {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  editable: boolean
  steps: readonly ProfileStepId[]
}[]

export type ProfileSectionId = (typeof PROFILE_SECTIONS)[number]["id"]

export function sectionForStep(step: ProfileStepId): ProfileSectionId {
  return (
    PROFILE_SECTIONS.find((section) => (section.steps as readonly ProfileStepId[]).includes(step))?.id ?? "basico"
  )
}

const FIELD_SECTION: Partial<Record<keyof UpdateCandidateProfileDto, ProfileSectionId>> = {
  headline: "basico",
  summary: "basico",
  phone: "basico",
  city: "basico",
  state: "basico",
  institution: "formacao",
  course: "formacao",
  currentSemester: "formacao",
  expectedGraduationYear: "formacao",
  linkedinUrl: "links",
  githubUrl: "links",
  portfolioUrl: "links",
}

export function sectionForField(field: string): ProfileSectionId {
  return FIELD_SECTION[field as keyof UpdateCandidateProfileDto] ?? "basico"
}
