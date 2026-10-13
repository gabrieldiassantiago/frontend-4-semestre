"use server"

import { apiFetch } from "@/lib/server/api"
import type { ActionResult } from "@/lib/actions/result"
import type { CreateTeamMemberDto, TeamMember, TeamResponse, UpdateTeamMemberDto } from "@/lib/types/team.types"

const id = (value: string) => encodeURIComponent(value)

export async function getTeamAction(): Promise<ActionResult<TeamResponse>> {
  return apiFetch<TeamResponse>("/empresa/equipe")
}

export async function createTeamMemberAction(dto: CreateTeamMemberDto): Promise<ActionResult<TeamMember>> {
  return apiFetch<TeamMember>("/empresa/equipe", { method: "POST", body: dto })
}

export async function updateTeamMemberAction(memberId: string, dto: UpdateTeamMemberDto): Promise<ActionResult<TeamMember>> {
  return apiFetch<TeamMember>(`/empresa/equipe/${id(memberId)}`, { method: "PATCH", body: dto })
}

export async function removeTeamMemberAction(memberId: string): Promise<ActionResult<null>> {
  return apiFetch<null>(`/empresa/equipe/${id(memberId)}`, { method: "DELETE", nullOn: [204] })
}
