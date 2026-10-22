"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteCompanyLogoAction, getCompanyProfileMeAction, updateCompanyProfileMeAction, uploadCompanyLogoAction } from "@/actions/company"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import { useCandidaturasEmpresa } from "./use-candidaturas"
import type { UpdateCompanyProfileDto } from "@/lib/types/company.types"

/**
 * Perfil da empresa logada. Várias telas leem ao mesmo tempo (shell, formulário
 * de vaga); o TanStack deduplica em uma única requisição.
 */
export function useCompanyProfile() {
  const query = useQuery({
    queryKey: queryKeys.companyProfile.me(),
    queryFn: async () => unwrap(await getCompanyProfileMeAction()),
  })

  return {
    profile: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? getErrorMessage(query.error, "Erro ao carregar perfil da empresa.") : null,
    refetch: query.refetch,
  }
}

/**
 * Identidade da empresa para qualquer pessoa da equipe. O dono lê do próprio
 * perfil; membros (sem perfil próprio) usam os dados desnormalizados das
 * candidaturas da empresa, que o backend já resolve pelo vínculo de membro.
 */
export function useCompanyIdentity() {
  const { profile, isLoading: profileLoading, error: profileError } = useCompanyProfile()
  const { candidaturas, loading: candidaturasLoading } = useCandidaturasEmpresa()
  const isOwner = Boolean(profile)
  const fromCandidatura = candidaturas.find((item) => item.companyProfileId)
  const companyProfileId = profile?.id ?? fromCandidatura?.companyProfileId ?? null
  const unresolved = !profileLoading && !profileError && !candidaturasLoading && !companyProfileId

  return {
    unresolved,
    profile,
    isOwner,
    companyProfileId,
    companyName: profile?.companyName || fromCandidatura?.nomeEmpresa || null,
    logoUrl: profile?.logoUrl ?? fromCandidatura?.logoUrlEmpresa ?? null,
    industry: profile?.industry ?? null,
    isLoading: profileLoading || (!profileLoading && !profile && candidaturasLoading),
    error: profileError,
  }
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: UpdateCompanyProfileDto) => unwrap(await updateCompanyProfileMeAction(dto)),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.companyProfile.me(), profile)
      toastSuccess("Perfil da empresa salvo!")
    },
  })
}

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const data = new FormData()
      data.set("file", file)
      return unwrap(await uploadCompanyLogoAction(data))
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.companyProfile.me(), profile)
      toastSuccess("Logotipo atualizado!")
    },
  })
}

export function useDeleteCompanyLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => unwrap(await deleteCompanyLogoAction()),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.companyProfile.me(), profile)
      toastSuccess("Logotipo removido!")
    },
  })
}
