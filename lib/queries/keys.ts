import type { CandidaturaFilters } from "@/lib/types/candidatura.types"
import type { VagaFilters, VagaProximasParams } from "@/lib/types/vaga.types"

/**
 * Chaves de cache do TanStack Query, centralizadas para que mutações em
 * qualquer tela invalidem exatamente as consultas afetadas.
 */
export const queryKeys = {
  candidateProfile: {
    all: ["candidate-profile"] as const,
    me: () => ["candidate-profile", "me"] as const,
    byUser: (userId: string) => ["candidate-profile", "user", userId] as const,
  },
  companyProfile: {
    me: () => ["company-profile", "me"] as const,
  },
  team: {
    all: ["team"] as const,
  },
  vagas: {
    all: ["vagas"] as const,
    list: (filters?: VagaFilters) => ["vagas", "list", filters ?? {}] as const,
    detail: (id: string) => ["vagas", "detail", id] as const,
    proximas: (params: VagaProximasParams | null) => ["vagas", "proximas", params ?? {}] as const,
    byEmpresa: (companyProfileId: string) => ["vagas", "empresa", companyProfileId] as const,
  },
  candidaturas: {
    all: ["candidaturas"] as const,
    minhas: () => ["candidaturas", "me"] as const,
    detalhe: (id: string) => ["candidaturas", "detalhe", id] as const,
    empresaLista: (filters?: CandidaturaFilters) => ["candidaturas", "empresa", "lista", filters ?? {}] as const,
    empresaDetalhe: (id: string) => ["candidaturas", "empresa", "detalhe", id] as const,
  },
  chat: {
    all: ["chat"] as const,
    lista: () => ["chat", "lista"] as const,
    detalhe: (candidaturaId: string) => ["chat", "detalhe", candidaturaId] as const,
    mensagens: (candidaturaId: string) => ["chat", "mensagens", candidaturaId] as const,
  },
  notificacoes: {
    all: ["notificacoes"] as const,
    resumo: () => ["notificacoes", "resumo"] as const,
  },
} as const
