import { apiRequest } from "@/lib/http/client"

import type { CandidateProfile, UpdateCandidateProfileDto, CreateExperienceDto, CreateProjectDto } from "@/lib/types/candidate.types"

/** Perfil compartilhado com a empresa; a API autoriza o acesso pelo usuário. */
export async function getCandidateProfileByUserId(userId: string): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/${encodeURIComponent(userId)}`, { method: "GET" })
}

export async function getCandidateProfileMe(): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me`, {
    method: "GET",
  })
}

export async function updateCandidateProfileMe(dto: UpdateCandidateProfileDto): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me`, {
    method: "PUT",
    body: JSON.stringify(dto),
  })
}

export async function addCandidateExperience(dto: CreateExperienceDto): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me/experiences`, {
    method: "POST",
    body: JSON.stringify(dto),
  })
}

export async function updateCandidateExperience(id: string, dto: CreateExperienceDto): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me/experiences/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  })
}

export async function deleteCandidateExperience(id: string): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me/experiences/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function addCandidateProject(dto: CreateProjectDto): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me/projects`, {
    method: "POST",
    body: JSON.stringify(dto),
  })
}

export async function updateCandidateProject(id: string, dto: CreateProjectDto): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me/projects/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  })
}

export async function deleteCandidateProject(id: string): Promise<CandidateProfile> {
  return apiRequest<CandidateProfile>(`/candidate-profile/me/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function uploadCandidateAvatar(file: File): Promise<CandidateProfile> {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<CandidateProfile>(`/candidate-profile/me/avatar`, {
    method: "PUT",
    body: formData,
  })
}

export async function uploadCandidateResume(file: File): Promise<CandidateProfile> {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<CandidateProfile>(`/candidate-profile/me/resume`, {
    method: "PUT",
    body: formData,
  })
}
