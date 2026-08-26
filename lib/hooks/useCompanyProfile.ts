"use client"

import useSWR from "swr"
import { getCompanyProfileMe } from "@/lib/services/company.service"
import type { CompanyProfile } from "@/lib/types/company.types"

/** Chave única do cache — permite revalidar de qualquer lugar. */
export const COMPANY_PROFILE_KEY = "company-profile/me"

/**
 * Perfil da empresa logada.
 *
 * Várias telas precisam do perfil ao mesmo tempo (o shell para o cabeçalho, o
 * formulário de vaga para o `companyProfileId`). O SWR deduplica essas chamadas
 * em uma única requisição e compartilha o resultado entre os componentes.
 */

export function useCompanyProfile() {
  const { data, error, isLoading, mutate } = useSWR<CompanyProfile>(
    COMPANY_PROFILE_KEY,
    () => getCompanyProfileMe(),
    { revalidateOnFocus: false },
  )

  return { profile: data ?? null, error, isLoading, mutate }
}
