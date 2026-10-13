export type TeamMemberRole = "ADMIN" | "RECRUTADOR"
export type TeamRole = "PROPRIETARIO" | TeamMemberRole

export interface TeamMember {
  /** `null` para o proprietário, que não pode ser editado nem removido. */
  memberId: string | null
  userId: string
  name: string
  email: string
  role: TeamRole
  active: boolean
  voce: boolean
  createdAt: string
}

export interface TeamResponse {
  meuPapel: TeamRole
  podeGerenciar: boolean
  membros: TeamMember[]
}

export interface CreateTeamMemberDto {
  name: string
  email: string
  password: string
  role: TeamMemberRole
}

export interface UpdateTeamMemberDto {
  role?: TeamMemberRole
  active?: boolean
  password?: string
}

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  PROPRIETARIO: "Proprietário",
  ADMIN: "Administrador",
  RECRUTADOR: "Recrutador",
}

export const TEAM_ROLE_DESCRIPTION: Record<TeamMemberRole, string> = {
  ADMIN: "Gerencia vagas, candidaturas, perfil da empresa e recrutadores.",
  RECRUTADOR: "Gerencia vagas, candidaturas e mensagens.",
}
