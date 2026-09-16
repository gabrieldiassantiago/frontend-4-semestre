// ── Enums ──────────────────────────────────────────────────────────────────

export type VagaModalidade = "PRESENCIAL" | "REMOTO" | "HIBRIDO"

export type NivelExperiencia =
  | "ESTAGIO"
  | "JUNIOR"
  | "PLENO"
  | "SENIOR"
  | "ESPECIALISTA"
  | "LIDERANCA"

export type VagaCategoria =
  | "DESENVOLVIMENTO_SOFTWARE"
  | "DESIGN_UX_UI"
  | "CIENCIA_DE_DADOS_IA"
  | "INFRAESTRUTURA_DEVOPS"
  | "MARKETING_DIGITAL"
  | "VENDAS"
  | "RECURSOS_HUMANOS"
  | "FINANCEIRO"
  | "CONTABILIDADE"
  | "JURIDICO"
  | "MEDICINA"
  | "ENFERMAGEM"
  | "DOCENCIA"
  | "ENGENHARIA_CIVIL"
  | "LOGISTICA"
  | "GASTRONOMIA"
  | "AGRONEGOCIO"
  | "OUTRO"

// ── Display Labels ──────────────────────────────────────────────────────────

export const MODALIDADE_LABELS: Record<VagaModalidade, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
}

export const NIVEL_LABELS: Record<NivelExperiencia, string> = {
  ESTAGIO: "Estágio",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  LIDERANCA: "Liderança",
}

export const CATEGORIA_LABELS: Record<VagaCategoria, string> = {
  DESENVOLVIMENTO_SOFTWARE: "Desenvolvimento de Software",
  DESIGN_UX_UI: "Design UX/UI",
  CIENCIA_DE_DADOS_IA: "Ciência de Dados & IA",
  INFRAESTRUTURA_DEVOPS: "Infraestrutura & DevOps",
  MARKETING_DIGITAL: "Marketing Digital",
  VENDAS: "Vendas",
  RECURSOS_HUMANOS: "Recursos Humanos",
  FINANCEIRO: "Financeiro",
  CONTABILIDADE: "Contabilidade",
  JURIDICO: "Jurídico",
  MEDICINA: "Medicina",
  ENFERMAGEM: "Enfermagem",
  DOCENCIA: "Docência",
  ENGENHARIA_CIVIL: "Engenharia Civil",
  LOGISTICA: "Logística",
  GASTRONOMIA: "Gastronomia",
  AGRONEGOCIO: "Agronegócio",
  OUTRO: "Outro",
}

// ── Interfaces ──────────────────────────────────────────────────────────────

/** Vaga retornada pela API */
export interface Vaga {
  id: string
  titulo: string
  salario: number
  descricao: string
  beneficios?: string
  companyProfileId: string
  nomeEmpresa?: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
  distanciaKm?: number
  categoria: VagaCategoria
  modalidade: VagaModalidade
  nivelExperiencia: NivelExperiencia
  ativa: boolean
  createdAt?: string
  updatedAt?: string
}

/** Payload para criar uma vaga */
export interface CreateVagaDto {
  titulo: string
  salario: number
  descricao: string
  beneficios?: string
  companyProfileId: string
  latitude: number
  longitude: number
  cidade?: string
  estado?: string
  categoria: VagaCategoria
  modalidade: VagaModalidade
  nivelExperiencia: NivelExperiencia
}

/** Payload para atualizar uma vaga (todos os campos são opcionais) */
export interface UpdateVagaDto {
  titulo?: string
  salario?: number
  descricao?: string
  beneficios?: string
  latitude?: number
  longitude?: number
  cidade?: string
  estado?: string
  categoria?: VagaCategoria
  modalidade?: VagaModalidade
  nivelExperiencia?: NivelExperiencia
  ativa?: boolean
}

/** Parâmetros para buscar vagas por proximidade */
export interface VagaProximasParams {
  latitude: number
  longitude: number
  raioKm?: number
}

/** Filtros para a listagem de vagas */
export interface VagaFilters {
  titulo?: string
  modalidade?: VagaModalidade
  categoria?: VagaCategoria
  nivelExperiencia?: NivelExperiencia
  cidade?: string
  estado?: string
  salarioMin?: number
  salarioMax?: number
  latitude?: number
  longitude?: number
  raioKm?: number
}
