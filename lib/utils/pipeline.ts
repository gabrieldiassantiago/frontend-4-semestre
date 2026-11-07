import type { Candidatura, StatusCandidatura } from "@/lib/types/candidatura.types"

export type PipelineStatus = "todos" | Extract<StatusCandidatura, "EM_ANDAMENTO" | "APROVADA" | "REPROVADA">
export type PipelineSort = "recentes" | "antigas" | "nome"

export interface PipelineFilters {
  busca: string
  status: PipelineStatus
  stage: string
  sort: PipelineSort
  withResume: boolean
}

export function filterPipelineCandidates(candidaturas: Candidatura[], filters: PipelineFilters): Candidatura[] {
  const query = filters.busca.trim().toLocaleLowerCase("pt-BR")

  return candidaturas
    .filter(item => {
      if (filters.status === "todos") return true
      if (filters.status === "REPROVADA") return item.status === "REPROVADA" || item.status === "CANCELADA"
      return item.status === filters.status
    })
    .filter(item => !filters.stage || item.etapaAtual === filters.stage)
    .filter(item => !filters.withResume || Boolean(item.curriculoUrl))
    .filter(item => !query || [item.candidatoNome, item.candidatoEmail, item.candidatoHeadline]
      .some(value => value?.toLocaleLowerCase("pt-BR").includes(query)))
    .sort((a, b) => {
      if (filters.sort === "nome") return (a.candidatoNome ?? "").localeCompare(b.candidatoNome ?? "", "pt-BR")
      if (filters.sort === "antigas") return (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    })
}

export function pipelineStages(configured: string[], candidaturas: Candidatura[]): string[] {
  return [...new Set([...configured, ...candidaturas.map(item => item.etapaAtual).filter(Boolean)])]
}
