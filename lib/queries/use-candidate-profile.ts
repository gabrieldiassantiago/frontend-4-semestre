"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addCandidateExperienceAction,
  addCandidateProjectAction,
  deleteCandidateExperienceAction,
  deleteCandidateProjectAction,
  getCandidateProfileByUserIdAction,
  getCandidateProfileMeAction,
  saveCandidateProfileAction,
  updateCandidateExperienceAction,
  updateCandidateProfileMeAction,
  updateCandidateProjectAction,
  uploadCandidateAvatarAction,
  uploadCandidateResumeAction,
} from "@/actions/candidate"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import type {
  CandidateProfile,
  CreateExperienceDto,
  CreateProfileDto,
  CreateProjectDto,
  UpdateCandidateProfileDto,
} from "@/lib/types/candidate.types"

/**
 * Perfil do candidato logado.
 * `null` significa "conta sem perfil ainda" (404) — não é erro.
 */
export function useCandidateProfile() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.candidateProfile.me(),
    queryFn: async () => unwrap(await getCandidateProfileMeAction()),
  })

  /**
   * Substitui o perfil em cache sem refazer a requisição: as rotas de
   * experiência/projeto/arquivo já devolvem o perfil inteiro.
   */
  const setProfile = useCallback(
    (profile: CandidateProfile | null) => queryClient.setQueryData(queryKeys.candidateProfile.me(), profile),
    [queryClient],
  )

  return {
    profile: query.data ?? null,
    hasProfile: Boolean(query.data),
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar o perfil.") : null,
    refetch: query.refetch,
    setProfile,
  }
}

/** Perfil de um candidato visto pela empresa (autorizado pela API via candidatura). */
export function useCandidateProfileByUser(userId: string | null | undefined) {
  const query = useQuery({
    queryKey: queryKeys.candidateProfile.byUser(userId ?? ""),
    queryFn: async () => unwrap(await getCandidateProfileByUserIdAction(userId as string)),
    enabled: Boolean(userId),
  })
  return {
    profile: query.data ?? null,
    loading: query.isPending && Boolean(userId),
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar o perfil.") : null,
    refetch: query.refetch,
  }
}

/** Fábrica de mutações que gravam o perfil devolvido pela API direto no cache. */
function useProfileMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<CandidateProfile>,
  successMessage?: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.candidateProfile.me(), profile)
      if (successMessage) toastSuccess(successMessage)
    },
  })
}

export function useUpdateCandidateProfile() {
  return useProfileMutation(
    async (dto: UpdateCandidateProfileDto) => unwrap(await updateCandidateProfileMeAction(dto)),
    "Alterações do perfil salvas!",
  )
}

export function useSaveCandidateProfile() {
  return useProfileMutation(
    async ({ dto, hasExistingProfile }: { dto: CreateProfileDto | UpdateCandidateProfileDto; hasExistingProfile: boolean }) =>
      unwrap(await saveCandidateProfileAction(dto, hasExistingProfile)),
  )
}

export function useAddCandidateExperience() {
  return useProfileMutation(async (dto: CreateExperienceDto) => unwrap(await addCandidateExperienceAction(dto)), "Experiência adicionada!")
}

export function useUpdateCandidateExperience() {
  return useProfileMutation(
    async ({ id, dto }: { id: string; dto: CreateExperienceDto }) => unwrap(await updateCandidateExperienceAction(id, dto)),
    "Experiência atualizada!",
  )
}

export function useDeleteCandidateExperience() {
  return useProfileMutation(async (id: string) => unwrap(await deleteCandidateExperienceAction(id)), "Experiência removida!")
}

export function useAddCandidateProject() {
  return useProfileMutation(async (dto: CreateProjectDto) => unwrap(await addCandidateProjectAction(dto)), "Projeto adicionado!")
}

export function useUpdateCandidateProject() {
  return useProfileMutation(
    async ({ id, dto }: { id: string; dto: CreateProjectDto }) => unwrap(await updateCandidateProjectAction(id, dto)),
    "Projeto atualizado!",
  )
}

export function useDeleteCandidateProject() {
  return useProfileMutation(async (id: string) => unwrap(await deleteCandidateProjectAction(id)), "Projeto removido!")
}

function toFormData(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

export function useUploadCandidateAvatar() {
  return useProfileMutation(async (file: File) => unwrap(await uploadCandidateAvatarAction(toFormData(file))), "Foto do perfil atualizada!")
}

export function useUploadCandidateResume(options?: { silent?: boolean }) {
  return useProfileMutation(
    async (file: File) => unwrap(await uploadCandidateResumeAction(toFormData(file))),
    options?.silent ? undefined : "Currículo enviado com sucesso!",
  )
}
