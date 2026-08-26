"use client"

import useSWR from "swr"
import { getCandidateProfileMe } from "@/lib/services/candidate.service"
import { getErrorMessage } from "@/lib/errors"
import type { CandidateProfile } from "@/lib/types/candidate.types"

/** Chave única do cache — permite revalidar de qualquer lugar. */
export const CANDIDATE_PROFILE_KEY = "candidate-profile/me"

/**
 * Perfil do candidato logado.
 *
 * Espelha o `useCompanyProfile`: o wizard de conclusão, a tela de perfil e o
 * fluxo de candidatura leem o mesmo recurso, e o SWR deduplica isso em uma
 * única requisição compartilhada.
 */
export function useCandidateProfile() {
  const { data, error, isLoading, mutate } = useSWR<CandidateProfile>(
    CANDIDATE_PROFILE_KEY,
    () => getCandidateProfileMe(),
    { revalidateOnFocus: false },
  )

  return {
    profile: data ?? null,
    loading: isLoading,
    error: error ? getErrorMessage(error, "Não foi possível carregar o perfil.") : null,
    refetch: () => mutate(),
    /**
     * Substitui o perfil em cache sem refazer a requisição.
     * As rotas de experiência e projeto já devolvem o perfil inteiro, então
     * revalidar depois de cada operação seria uma ida ao servidor sem ganho.
     */
    setProfile: (profile: CandidateProfile) => mutate(profile, { revalidate: false }),
    mutate,
  }
}
