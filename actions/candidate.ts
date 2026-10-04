"use server"

import { apiFetch } from "@/lib/server/api"
import type { ActionResult } from "@/lib/actions/result"
import type {
  CandidateProfile,
  CreateExperienceDto,
  CreateProfileDto,
  CreateProjectDto,
  UpdateCandidateProfileDto,
} from "@/lib/types/candidate.types"

const ME = "/candidate-profile/me"

/** Perfil compartilhado com a empresa; a API autoriza o acesso pelo usuário. */
export async function getCandidateProfileByUserIdAction(userId: string): Promise<ActionResult<CandidateProfile>> {
  return apiFetch<CandidateProfile>(`/candidate-profile/${encodeURIComponent(userId)}`)
}

/** 404 significa "conta criada, perfil ainda não gerado" e vira `null`. */
export async function getCandidateProfileMeAction(): Promise<ActionResult<CandidateProfile | null>> {
  return apiFetch<CandidateProfile | null>(ME, { nullOn: [404] })
}

/** POST; se já existir (409) faz fallback para PUT. */
export async function createCandidateProfileAction(dto: CreateProfileDto = {}): Promise<ActionResult<CandidateProfile>> {
  const result = await apiFetch<CandidateProfile>(ME, { method: "POST", body: dto })
  if (!result.ok && result.status === 409) return apiFetch<CandidateProfile>(ME, { method: "PUT", body: dto })
  return result
}

/** PUT; se o perfil ainda não existir (404) cria automaticamente. */
export async function updateCandidateProfileMeAction(dto: UpdateCandidateProfileDto): Promise<ActionResult<CandidateProfile>> {
  const result = await apiFetch<CandidateProfile>(ME, { method: "PUT", body: dto })
  if (!result.ok && result.status === 404) return apiFetch<CandidateProfile>(ME, { method: "POST", body: dto })
  return result
}

export async function saveCandidateProfileAction(
  dto: CreateProfileDto | UpdateCandidateProfileDto,
  hasExistingProfile = true,
): Promise<ActionResult<CandidateProfile>> {
  return hasExistingProfile ? updateCandidateProfileMeAction(dto) : createCandidateProfileAction(dto)
}

/**
 * Sub-recursos (experiências, projetos, arquivos) exigem que o perfil exista.
 * Em 404 o perfil é criado vazio e a operação é repetida uma única vez.
 */
async function withProfile<T>(request: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  const first = await request()
  if (first.ok || first.status !== 404) return first
  const created = await createCandidateProfileAction({})
  if (!created.ok) return created as ActionResult<T>
  return request()
}

export async function addCandidateExperienceAction(dto: CreateExperienceDto): Promise<ActionResult<CandidateProfile>> {
  return withProfile(() => apiFetch<CandidateProfile>(`${ME}/experiences`, { method: "POST", body: dto }))
}

export async function updateCandidateExperienceAction(id: string, dto: CreateExperienceDto): Promise<ActionResult<CandidateProfile>> {
  return apiFetch<CandidateProfile>(`${ME}/experiences/${encodeURIComponent(id)}`, { method: "PUT", body: dto })
}

export async function deleteCandidateExperienceAction(id: string): Promise<ActionResult<CandidateProfile>> {
  return apiFetch<CandidateProfile>(`${ME}/experiences/${encodeURIComponent(id)}`, { method: "DELETE" })
}

export async function addCandidateProjectAction(dto: CreateProjectDto): Promise<ActionResult<CandidateProfile>> {
  return withProfile(() => apiFetch<CandidateProfile>(`${ME}/projects`, { method: "POST", body: dto }))
}

export async function updateCandidateProjectAction(id: string, dto: CreateProjectDto): Promise<ActionResult<CandidateProfile>> {
  return apiFetch<CandidateProfile>(`${ME}/projects/${encodeURIComponent(id)}`, { method: "PUT", body: dto })
}

export async function deleteCandidateProjectAction(id: string): Promise<ActionResult<CandidateProfile>> {
  return apiFetch<CandidateProfile>(`${ME}/projects/${encodeURIComponent(id)}`, { method: "DELETE" })
}

/** Recebe o FormData do cliente (campo `file`) e repassa como multipart para a API. */
export async function uploadCandidateAvatarAction(formData: FormData): Promise<ActionResult<CandidateProfile>> {
  return withProfile(() => apiFetch<CandidateProfile>(`${ME}/avatar`, { method: "PUT", body: formData }))
}

export async function uploadCandidateResumeAction(formData: FormData): Promise<ActionResult<CandidateProfile>> {
  return withProfile(() => apiFetch<CandidateProfile>(`${ME}/resume`, { method: "PUT", body: formData }))
}
