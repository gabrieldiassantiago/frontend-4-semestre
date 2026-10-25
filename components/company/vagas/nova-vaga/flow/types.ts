import type {
  VagaCategoria,
  VagaModalidade,
} from "@/lib/types/vaga.types"
import type { EtapaProcesso } from "@/lib/types/candidatura.types"

export interface VagaDraft {
  titulo: string
  categoria: VagaCategoria
  modalidade: VagaModalidade
  quantidadeVagas: number
  salario: number
  cidade: string
  estado: string
  latitude: number
  longitude: number
  beneficios: string[]
  descricao: string
  etapas: EtapaProcesso[]
  metaTags: string[]
}

export type DraftField = "titulo" | "cidade" | "salario" | "descricao" | "etapas" | "quantidadeVagas"
export type DraftErrors = Partial<Record<DraftField, string>>

export type StepId =
  | "titulo"
  | "perfil"
  | "local"
  | "salario"
  | "beneficios"
  | "descricao"
  | "processo"
  | "revisao"

export interface StepProps {
  draft: VagaDraft
  update: (patch: Partial<VagaDraft>) => void
  errors: DraftErrors
}
