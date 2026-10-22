"use server"

import { apiFetch } from "@/lib/server/api"
import type { ActionResult } from "@/lib/actions/result"
import type {
  CompanyMembersApiDto,
  CreateTeamMemberDto,
  TeamMember,
  UpdateTeamMemberDto,
} from "@/lib/types/team.types"

const id = (value: string) => encodeURIComponent(value)

export async function getTeamAction(): Promise<ActionResult<CompanyMembersApiDto>> {
  return apiFetch<CompanyMembersApiDto>("/empresa/equipe")
}

export async function createTeamMemberAction(dto: CreateTeamMemberDto): Promise<ActionResult<TeamMember>> {
  return apiFetch<TeamMember>("/empresa/equipe", { method: "POST", body: dto })
}

export async function updateTeamMemberAction(userId: string, dto: UpdateTeamMemberDto): Promise<ActionResult<TeamMember>> {
  return apiFetch<TeamMember>(`/empresa/equipe/${id(userId)}`, { method: "PATCH", body: dto })
}

export async function removeTeamMemberAction(userId: string): Promise<ActionResult<null>> {
  return apiFetch<null>(`/empresa/equipe/${id(userId)}`, { method: "DELETE", nullOn: [204] })
}
