export type TeamMemberRole = "ADMIN" | "RECRUTADOR"

export type TeamRole = "PROPRIETARIO" | TeamMemberRole

/**
 * O proprietário não aparece na lista: ele é o dono do `CompanyProfile`, não um
 * `CompanyMember`. As rotas PATCH/DELETE do backend recebem o `userId`.
 */
export interface TeamMember {
  memberId: string
  userId: string
  name: string
  email: string
  role: TeamMemberRole
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
  name?: string
  password?: string
  role?: TeamMemberRole
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

export type CompanyMemberApiDto = {
  memberId: string
  userId: string
  name: string
  email: string
  role: TeamMemberRole
  active: boolean | null
  voce: boolean
  createdAt: string
}

export type CompanyMembersApiDto = {
  podeGerencias: boolean
  companyMembersDto: CompanyMemberApiDto[] | null
}

/** Quem não aparece como `voce` na própria lista é o proprietário da empresa. */
export function mapCompanyMembersApi(data: CompanyMembersApiDto): TeamResponse {
  const membros: TeamMember[] = (data.companyMembersDto ?? []).map((member) => ({
    ...member,
    active: member.active !== false,
  }))
  const membroAtual = membros.find((member) => member.voce)

  return {
    podeGerenciar: Boolean(data.podeGerencias),
    meuPapel: membroAtual?.role ?? "PROPRIETARIO",
    membros,
  }
}
