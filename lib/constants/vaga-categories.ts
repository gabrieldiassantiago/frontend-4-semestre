import React from "react"
import {
  BrainCircuit,
  Briefcase,
  Building2,
  Calculator,
  Code2,
  DollarSign,
  GraduationCap,
  HardHat,
  HeartPulse,
  Layers,
  Megaphone,
  Palette,
  Scale,
  Server,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Wheat,
} from "lucide-react"
import type { NivelExperiencia, VagaCategoria } from "@/lib/types/vaga.types"

export interface CategoryMetadata {
  id: VagaCategoria
  label: string
  shortLabel?: string
  icon: React.ComponentType<{ className?: string }>
  sector: string
  color: string
}

export interface CategorySector {
  name: string
  icon: React.ComponentType<{ className?: string }>
  categories: CategoryMetadata[]
}

export const CATEGORY_METADATA: Record<VagaCategoria, CategoryMetadata> = {
  DESENVOLVIMENTO_SOFTWARE: {
    id: "DESENVOLVIMENTO_SOFTWARE",
    label: "Desenvolvimento de Software",
    shortLabel: "Software & Dev",
    icon: Code2,
    sector: "Tecnologia & Dados",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  CIENCIA_DE_DADOS_IA: {
    id: "CIENCIA_DE_DADOS_IA",
    label: "Ciência de Dados & IA",
    shortLabel: "Dados & IA",
    icon: BrainCircuit,
    sector: "Tecnologia & Dados",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  INFRAESTRUTURA_DEVOPS: {
    id: "INFRAESTRUTURA_DEVOPS",
    label: "Infraestrutura & DevOps",
    shortLabel: "DevOps & Cloud",
    icon: Server,
    sector: "Tecnologia & Dados",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  DESIGN_UX_UI: {
    id: "DESIGN_UX_UI",
    label: "Design UX/UI & Produto",
    shortLabel: "Design & UX",
    icon: Palette,
    sector: "Criativo & Marketing",
    color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
  },
  MARKETING_DIGITAL: {
    id: "MARKETING_DIGITAL",
    label: "Marketing Digital & Growth",
    shortLabel: "Marketing",
    icon: Megaphone,
    sector: "Criativo & Marketing",
    color: "text-pink-600 bg-pink-50 border-pink-200",
  },
  VENDAS: {
    id: "VENDAS",
    label: "Vendas & Comercial",
    shortLabel: "Comercial & Vendas",
    icon: TrendingUp,
    sector: "Negócios & Gestão",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  RECURSOS_HUMANOS: {
    id: "RECURSOS_HUMANOS",
    label: "Recursos Humanos & People",
    shortLabel: "RH & People",
    icon: Users,
    sector: "Negócios & Gestão",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  FINANCEIRO: {
    id: "FINANCEIRO",
    label: "Financeiro & Controladoria",
    shortLabel: "Financeiro",
    icon: DollarSign,
    sector: "Negócios & Gestão",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  CONTABILIDADE: {
    id: "CONTABILIDADE",
    label: "Contabilidade & Fiscal",
    shortLabel: "Contabilidade",
    icon: Calculator,
    sector: "Negócios & Gestão",
    color: "text-teal-600 bg-teal-50 border-teal-200",
  },
  MEDICINA: {
    id: "MEDICINA",
    label: "Medicina & Saúde",
    shortLabel: "Medicina",
    icon: Stethoscope,
    sector: "Saúde & Cuidados",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  ENFERMAGEM: {
    id: "ENFERMAGEM",
    label: "Enfermagem & Assistência",
    shortLabel: "Enfermagem",
    icon: HeartPulse,
    sector: "Saúde & Cuidados",
    color: "text-rose-700 bg-rose-50 border-rose-200",
  },
  ENGENHARIA_CIVIL: {
    id: "ENGENHARIA_CIVIL",
    label: "Engenharia Civil & Construção",
    shortLabel: "Engenharia",
    icon: HardHat,
    sector: "Engenharia & Operações",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  LOGISTICA: {
    id: "LOGISTICA",
    label: "Logística & Supply Chain",
    shortLabel: "Logística",
    icon: Truck,
    sector: "Engenharia & Operações",
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  JURIDICO: {
    id: "JURIDICO",
    label: "Jurídico & Compliance",
    shortLabel: "Jurídico",
    icon: Scale,
    sector: "Jurídico & Educação",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  DOCENCIA: {
    id: "DOCENCIA",
    label: "Docência & Educação",
    shortLabel: "Educação",
    icon: GraduationCap,
    sector: "Jurídico & Educação",
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  GASTRONOMIA: {
    id: "GASTRONOMIA",
    label: "Gastronomia & Alimentos",
    shortLabel: "Gastronomia",
    icon: Utensils,
    sector: "Serviços & Outros",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  AGRONEGOCIO: {
    id: "AGRONEGOCIO",
    label: "Agronegócio & Campo",
    shortLabel: "Agronegócio",
    icon: Wheat,
    sector: "Serviços & Outros",
    color: "text-lime-700 bg-lime-50 border-lime-200",
  },
  OUTRO: {
    id: "OUTRO",
    label: "Outras Áreas",
    shortLabel: "Geral",
    icon: Briefcase,
    sector: "Serviços & Outros",
    color: "text-zinc-600 bg-zinc-50 border-zinc-200",
  },
}

export const CATEGORY_SECTORS: CategorySector[] = [
  {
    name: "Negócios & Gestão",
    icon: Building2,
    categories: [
      CATEGORY_METADATA.VENDAS,
      CATEGORY_METADATA.RECURSOS_HUMANOS,
      CATEGORY_METADATA.FINANCEIRO,
      CATEGORY_METADATA.CONTABILIDADE,
    ],
  },
  {
    name: "Saúde & Cuidados",
    icon: HeartPulse,
    categories: [CATEGORY_METADATA.MEDICINA, CATEGORY_METADATA.ENFERMAGEM],
  },
  {
    name: "Tecnologia & Dados",
    icon: Code2,
    categories: [
      CATEGORY_METADATA.DESENVOLVIMENTO_SOFTWARE,
      CATEGORY_METADATA.CIENCIA_DE_DADOS_IA,
      CATEGORY_METADATA.INFRAESTRUTURA_DEVOPS,
    ],
  },
  {
    name: "Criativo & Marketing",
    icon: Palette,
    categories: [
      CATEGORY_METADATA.MARKETING_DIGITAL,
      CATEGORY_METADATA.DESIGN_UX_UI,
    ],
  },
  {
    name: "Engenharia & Operações",
    icon: HardHat,
    categories: [
      CATEGORY_METADATA.ENGENHARIA_CIVIL,
      CATEGORY_METADATA.LOGISTICA,
    ],
  },
  {
    name: "Jurídico & Educação",
    icon: Scale,
    categories: [CATEGORY_METADATA.JURIDICO, CATEGORY_METADATA.DOCENCIA],
  },
  {
    name: "Serviços & Agro",
    icon: Sparkles,
    categories: [
      CATEGORY_METADATA.GASTRONOMIA,
      CATEGORY_METADATA.AGRONEGOCIO,
      CATEGORY_METADATA.OUTRO,
    ],
  },
]

export interface NivelMetadata {
  id: NivelExperiencia
  label: string
  tag: string
  badgeVariant: "emerald" | "sky" | "indigo" | "amber" | "purple" | "rose"
  bgStyle: string
  textStyle: string
  borderStyle: string
  description: string
}

export const NIVEL_METADATA: Record<NivelExperiencia, NivelMetadata> = {
  ESTAGIO: {
    id: "ESTAGIO",
    label: "Estágio / Trainee",
    tag: "Estágio",
    badgeVariant: "emerald",
    bgStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    textStyle: "text-emerald-700",
    borderStyle: "border-emerald-200",
    description: "Para estudantes e recém-ingressantes no mercado",
  },
  JUNIOR: {
    id: "JUNIOR",
    label: "Júnior (Início de carreira)",
    tag: "Júnior",
    badgeVariant: "sky",
    bgStyle: "bg-sky-50 text-sky-700 border-sky-200",
    textStyle: "text-sky-700",
    borderStyle: "border-sky-200",
    description: "Até 2 anos de experiência ou atuação inicial",
  },
  PLENO: {
    id: "PLENO",
    label: "Pleno (Intermediário)",
    tag: "Pleno",
    badgeVariant: "indigo",
    bgStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
    textStyle: "text-indigo-700",
    borderStyle: "border-indigo-200",
    description: "Autonomia e domínio das principais funções",
  },
  SENIOR: {
    id: "SENIOR",
    label: "Sênior (Avançado)",
    tag: "Sênior",
    badgeVariant: "amber",
    bgStyle: "bg-amber-50 text-amber-800 border-amber-200",
    textStyle: "text-amber-800",
    borderStyle: "border-amber-200",
    description: "Alta senioridade, resolução de problemas complexos",
  },
  ESPECIALISTA: {
    id: "ESPECIALISTA",
    label: "Especialista / Consultor",
    tag: "Especialista",
    badgeVariant: "purple",
    bgStyle: "bg-purple-50 text-purple-700 border-purple-200",
    textStyle: "text-purple-700",
    borderStyle: "border-purple-200",
    description: "Referência técnica profunda e estratégia",
  },
  LIDERANCA: {
    id: "LIDERANCA",
    label: "Liderança / Gestão",
    tag: "Liderança",
    badgeVariant: "rose",
    bgStyle: "bg-rose-50 text-rose-700 border-rose-200",
    textStyle: "text-rose-700",
    borderStyle: "border-rose-200",
    description: "Coordenação de equipes, gerência ou diretoria",
  },
}
