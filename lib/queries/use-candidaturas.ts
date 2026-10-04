"use client"

import { useMemo } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  atualizarFeedbackAction,
  atualizarAgendamentoAction,
  avancarEtapaAction,
  cancelarAgendamentoAction,
  confirmarAgendamentoAction,
  criarAgendamentoAction,
  criarCandidaturaAction,
  criarFeedbackAction,
  decidirCandidaturaAction,
  desistirCandidaturaAction,
  getCandidaturaDetalheAction,
  getCandidaturaEmpresaDetalheAction,
  getCandidaturasEmpresaAction,
  getMinhasCandidaturasAction,
  removerFeedbackAction,
  recusarAgendamentoAction,
} from "@/actions/candidatura"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import type {
  AvancarEtapaDto,
  CandidaturaAgendamento,
  Candidatura,
  CandidaturaFilters,
  CreateCandidaturaDto,
  CreateAgendamentoDto,
  CreateFeedbackDto,
  DecidirCandidaturaDto,
} from "@/lib/types/candidatura.types"

// ── Consultas ──────────────────────────────────────────────────────────────

export function useMinhasCandidaturas() {
  const query = useQuery({
    queryKey: queryKeys.candidaturas.minhas(),
    queryFn: async () => unwrap(await getMinhasCandidaturasAction()),
  })
  return {
    candidaturas: query.data ?? [],
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar suas candidaturas.") : null,
    refetch: query.refetch,
  }
}

/** Mapa vagaId → candidatura, para trocar o CTA por "Acompanhar candidatura". */
export function useCandidaturasPorVaga() {
  const { candidaturas, loading, refetch } = useMinhasCandidaturas()
  const porVaga = useMemo(() => {
    const map = new Map<string, Candidatura>()
    candidaturas.forEach((candidatura: Candidatura) => {
      if (candidatura.vagaId) map.set(candidatura.vagaId, candidatura)
    })
    return map
  }, [candidaturas])
  return { porVaga, loading, refetch }
}

export function useCandidatura(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.candidaturas.detalhe(id ?? ""),
    queryFn: async () => unwrap(await getCandidaturaDetalheAction(id as string)),
    enabled: Boolean(id),
  })
  return {
    detalhe: query.data ?? null,
    loading: Boolean(id) && query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar a candidatura.") : null,
    refetch: query.refetch,
  }
}

export function useCandidaturasEmpresa(filters?: CandidaturaFilters) {
  const query = useQuery({
    queryKey: queryKeys.candidaturas.empresaLista(filters),
    queryFn: async () => unwrap(await getCandidaturasEmpresaAction(filters)),
    placeholderData: keepPreviousData,
  })
  return {
    candidaturas: query.data ?? [],
    loading: query.isPending,
    refreshing: query.isFetching && !query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar o funil.") : null,
    refetch: query.refetch,
  }
}

export function useCandidaturaEmpresa(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.candidaturas.empresaDetalhe(id ?? ""),
    queryFn: async () => unwrap(await getCandidaturaEmpresaDetalheAction(id as string)),
    enabled: Boolean(id),
  })
  return {
    detalhe: query.data ?? null,
    loading: Boolean(id) && query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar a candidatura.") : null,
    refetch: query.refetch,
  }
}

// ── Mutações ───────────────────────────────────────────────────────────────

/**
 * O funil da empresa e o acompanhamento do candidato leem o mesmo recurso por
 * caminhos diferentes; qualquer mutação invalida a árvore inteira.
 */
function useInvalidateCandidaturas() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.candidaturas.all })
}

export function useCriarCandidatura() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async (dto: CreateCandidaturaDto) => unwrap(await criarCandidaturaAction(dto)),
    onSuccess: () => {
      toastSuccess("Candidatura enviada com sucesso!")
      void invalidate()
    },
  })
}

export function useDesistirCandidatura() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await desistirCandidaturaAction(id)),
    onSuccess: () => {
      toastSuccess("Candidatura cancelada.")
      void invalidate()
    },
  })
}

export function useConfirmarAgendamento() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ candidaturaId, agendamentoId }: { candidaturaId: string; agendamentoId: string }) =>
      unwrap(await confirmarAgendamentoAction(candidaturaId, agendamentoId)),
    onSuccess: () => {
      toastSuccess("Agendamento confirmado!")
      void invalidate()
    },
  })
}

export function useRecusarAgendamento() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ candidaturaId, agendamentoId }: { candidaturaId: string; agendamentoId: string }) =>
      unwrap(await recusarAgendamentoAction(candidaturaId, agendamentoId)),
    onSuccess: () => {
      toastSuccess("Agendamento recusado.")
      void invalidate()
    },
  })
}

export function useAvancarEtapa() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: AvancarEtapaDto }) => unwrap(await avancarEtapaAction(id, dto)),
    onSuccess: () => {
      toastSuccess("Etapa atualizada!")
      void invalidate()
    },
  })
}

export function useDecidirCandidatura() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: DecidirCandidaturaDto }) => unwrap(await decidirCandidaturaAction(id, dto)),
    onSuccess: () => {
      toastSuccess("Decisão registrada!")
      void invalidate()
    },
  })
}

export function useCriarFeedback() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CreateFeedbackDto }) => unwrap(await criarFeedbackAction(id, dto)),
    onSuccess: () => {
      toastSuccess("Feedback enviado!")
      void invalidate()
    },
  })
}

export function useCriarAgendamento() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CreateAgendamentoDto }) => unwrap(await criarAgendamentoAction(id, dto)),
    onSuccess: () => {
      toastSuccess("Agendamento enviado ao candidato!")
      void invalidate()
    },
  })
}

export function useAtualizarAgendamento() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, agendamentoId, dto }: { id: string; agendamentoId: string; dto: CreateAgendamentoDto }) =>
      unwrap(await atualizarAgendamentoAction(id, agendamentoId, dto)),
    onSuccess: () => {
      toastSuccess("Agendamento atualizado!")
      void invalidate()
    },
  })
}

export function useCancelarAgendamento() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, agendamentoId, motivo }: { id: string; agendamentoId: string; motivo?: string }) =>
      unwrap(await cancelarAgendamentoAction(id, agendamentoId, motivo)),
    onSuccess: () => {
      toastSuccess("Agendamento cancelado.")
      void invalidate()
    },
  })
}

export function useAtualizarFeedback() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, feedbackId, dto }: { id: string; feedbackId: string; dto: CreateFeedbackDto }) =>
      unwrap(await atualizarFeedbackAction(id, feedbackId, dto)),
    onSuccess: () => {
      toastSuccess("Feedback atualizado!")
      void invalidate()
    },
  })
}

export function useRemoverFeedback() {
  const invalidate = useInvalidateCandidaturas()
  return useMutation({
    mutationFn: async ({ id, feedbackId }: { id: string; feedbackId: string }) => unwrap(await removerFeedbackAction(id, feedbackId)),
    onSuccess: () => {
      toastSuccess("Feedback removido!")
      void invalidate()
    },
  })
}
