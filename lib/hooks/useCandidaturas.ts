"use client"

import { useMemo } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import {
  getCandidaturaDetalhe,
  getCandidaturaEmpresaDetalhe,
  getCandidaturasEmpresa,
  getMinhasCandidaturas,
} from "@/lib/services/candidatura.service"
import { getErrorMessage } from "@/lib/errors"
import type { CandidaturaFilters } from "@/lib/types/candidatura.types"

/**
 * Chaves de cache do módulo. Centralizadas para que uma mutação em qualquer
 * tela revalide exatamente as listas afetadas — o funil da empresa e o
 * acompanhamento do candidato leem o mesmo recurso por caminhos diferentes.
 */
export const candidaturaKeys = {
  minhas: "candidaturas:me",
  detalhe: (id: string) => `candidaturas:${id}`,
  empresaLista: (filters?: CandidaturaFilters) =>
    `empresa:candidaturas:${JSON.stringify(filters ?? {})}`,
  empresaDetalhe: (id: string) => `empresa:candidaturas:${id}`,
} as const

/** Revalida tudo que depende de uma candidatura específica. */
export async function revalidarCandidatura(id?: string) {
  await globalMutate(
    (key) =>
      typeof key === "string" &&
      (key.startsWith("empresa:candidaturas") ||
        key === candidaturaKeys.minhas ||
        (id ? key.endsWith(`:${id}`) : key.startsWith("candidaturas:"))),
    undefined,
    { revalidate: true },
  )
}

/** Minhas candidaturas (candidato). */
export function useMinhasCandidaturas() {
  const { data, error, isLoading, mutate } = useSWR(
    candidaturaKeys.minhas,
    getMinhasCandidaturas,
    { revalidateOnFocus: false },
  )

  return {
    candidaturas: data ?? [],
    loading: isLoading,
    error: error ? getErrorMessage(error, "Não foi possível carregar suas candidaturas.") : null,
    refetch: mutate,
  }
}

/**
 * Conjunto de vagas em que o candidato já se inscreveu.
 * Usado para trocar o CTA da vaga por "Acompanhar candidatura".
 */
export function useCandidaturasPorVaga() {
  const { candidaturas, loading, refetch } = useMinhasCandidaturas()

  const porVaga = useMemo(() => {
    const map = new Map<string, (typeof candidaturas)[number]>()
    candidaturas.forEach((candidatura) => {
      if (candidatura.vagaId) map.set(candidatura.vagaId, candidatura)
    })
    return map
  }, [candidaturas])

  return { porVaga, loading, refetch }
}

/** Acompanhamento completo de uma candidatura (candidato). */
export function useCandidatura(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? candidaturaKeys.detalhe(id) : null,
    () => getCandidaturaDetalhe(id as string),
    { revalidateOnFocus: false },
  )

  return {
    detalhe: data ?? null,
    loading: isLoading,
    error: error ? getErrorMessage(error, "Não foi possível carregar a candidatura.") : null,
    refetch: mutate,
  }
}

/** Funil das vagas da empresa logada. */
export function useCandidaturasEmpresa(filters?: CandidaturaFilters) {
  const key = candidaturaKeys.empresaLista(filters)

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getCandidaturasEmpresa(filters),
    { revalidateOnFocus: false, keepPreviousData: true },
  )

  return {
    candidaturas: data ?? [],
    loading: isLoading,
    refreshing: isValidating && !isLoading,
    error: error ? getErrorMessage(error, "Não foi possível carregar o funil.") : null,
    refetch: mutate,
  }
}

/** Candidatura completa na visão da empresa. */
export function useCandidaturaEmpresa(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? candidaturaKeys.empresaDetalhe(id) : null,
    () => getCandidaturaEmpresaDetalhe(id as string),
    { revalidateOnFocus: false },
  )

  return {
    detalhe: data ?? null,
    loading: isLoading,
    error: error ? getErrorMessage(error, "Não foi possível carregar a candidatura.") : null,
    refetch: mutate,
  }
}
