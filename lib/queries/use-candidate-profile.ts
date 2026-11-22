"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addCandidateCertificateAction,
  addCandidateExperienceAction,
  addCandidateLanguageAction,
  addCandidateProjectAction,
  deleteCandidateCertificateAction,
  deleteCandidateCertificateFileAction,
  deleteCandidateExperienceAction,
  deleteCandidateLanguageAction,
  deleteCandidateLanguageCertificateAction,
  deleteCandidateProjectAction,
  getCandidateProfileByUserIdAction,
  getCandidateProfileMeAction,
  saveCandidateProfileAction,
  updateCandidateCertificateAction,
  updateCandidateExperienceAction,
  updateCandidateLanguageAction,
  updateCandidateProfileMeAction,
  updateCandidateProjectAction,
  uploadCandidateAvatarAction,
  uploadCandidateCertificateFileAction,
  uploadCandidateLanguageCertificateAction,
  uploadCandidateResumeAction,
} from "@/actions/candidate"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import type {
  CandidateCertificate,
  CandidateLanguage,
  CandidateProfile,
  CreateCertificateDto,
  CreateExperienceDto,
  CreateLanguageDto,
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

/* ---------- Certificados e idiomas ----------
 * As rotas de item devolvem só o item (ou nada, no DELETE). Por isso o cache
 * do perfil é ajustado localmente, sem um novo GET.
 */

type ListKey = "certificates" | "languages"
type QueryClient = ReturnType<typeof useQueryClient>

function patchProfileList(queryClient: QueryClient, key: ListKey, update: (list: unknown[]) => unknown[]) {
  const current = queryClient.getQueryData<CandidateProfile | null>(queryKeys.candidateProfile.me())
  // Sem perfil em cache (ex.: criado pelo próprio POST), busca o perfil completo.
  if (!current) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.candidateProfile.me() })
    return
  }
  queryClient.setQueryData<CandidateProfile | null>(queryKeys.candidateProfile.me(), {
    ...current,
    [key]: update((current[key] ?? []) as unknown[]),
  } as CandidateProfile)
}

function upsertById<T extends { id: string }>(list: unknown[], item: T, sort: (a: T, b: T) => number): T[] {
  const items = list as T[]
  const next = items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item]
  return next.sort(sort)
}

const byIssueDateDesc = (a: CandidateCertificate, b: CandidateCertificate) => b.issueDate.localeCompare(a.issueDate)
const byLanguageName = (a: CandidateLanguage, b: CandidateLanguage) => a.language.localeCompare(b.language, "pt-BR")

/** Mutação de item que devolve o item e o põe no lugar certo do cache. */
function useItemMutation<TVariables, TItem extends { id: string }>(
  key: ListKey,
  mutationFn: (variables: TVariables) => Promise<TItem>,
  sort: (a: TItem, b: TItem) => number,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (item) => patchProfileList(queryClient, key, (list) => upsertById(list, item, sort)),
  })
}

/** Mutação de remoção: o servidor responde 204, então o id é usado no cache. */
function useRemoveItemMutation(key: ListKey, mutationFn: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (_data, id) =>
      patchProfileList(queryClient, key, (list) => (list as { id: string }[]).filter((item) => item.id !== id)),
  })
}

export function useAddCandidateCertificate() {
  return useItemMutation<CreateCertificateDto, CandidateCertificate>(
    "certificates",
    async (dto) => unwrap(await addCandidateCertificateAction(dto)),
    byIssueDateDesc,
  )
}

export function useUpdateCandidateCertificate() {
  return useItemMutation<{ id: string; dto: CreateCertificateDto }, CandidateCertificate>(
    "certificates",
    async ({ id, dto }) => unwrap(await updateCandidateCertificateAction(id, dto)),
    byIssueDateDesc,
  )
}

export function useDeleteCandidateCertificate() {
  return useRemoveItemMutation("certificates", async (id) => unwrap(await deleteCandidateCertificateAction(id)))
}

export function useUploadCandidateCertificateFile() {
  return useItemMutation<{ id: string; file: File }, CandidateCertificate>(
    "certificates",
    async ({ id, file }) => unwrap(await uploadCandidateCertificateFileAction(id, toFormData(file))),
    byIssueDateDesc,
  )
}

export function useDeleteCandidateCertificateFile() {
  return useItemMutation<string, CandidateCertificate>(
    "certificates",
    async (id) => unwrap(await deleteCandidateCertificateFileAction(id)),
    byIssueDateDesc,
  )
}

export function useAddCandidateLanguage() {
  return useItemMutation<CreateLanguageDto, CandidateLanguage>(
    "languages",
    async (dto) => unwrap(await addCandidateLanguageAction(dto)),
    byLanguageName,
  )
}

export function useUpdateCandidateLanguage() {
  return useItemMutation<{ id: string; dto: CreateLanguageDto }, CandidateLanguage>(
    "languages",
    async ({ id, dto }) => unwrap(await updateCandidateLanguageAction(id, dto)),
    byLanguageName,
  )
}

export function useDeleteCandidateLanguage() {
  return useRemoveItemMutation("languages", async (id) => unwrap(await deleteCandidateLanguageAction(id)))
}

export function useUploadCandidateLanguageCertificate() {
  return useItemMutation<{ id: string; file: File }, CandidateLanguage>(
    "languages",
    async ({ id, file }) => unwrap(await uploadCandidateLanguageCertificateAction(id, toFormData(file))),
    byLanguageName,
  )
}

export function useDeleteCandidateLanguageCertificate() {
  return useItemMutation<string, CandidateLanguage>(
    "languages",
    async (id) => unwrap(await deleteCandidateLanguageCertificateAction(id)),
    byLanguageName,
  )
}
