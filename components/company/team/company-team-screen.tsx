"use client"

import { useState } from "react"
import { UserPlus, UsersRound } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Alert, CardSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { useTeam } from "@/lib/queries/use-team"
import { TEAM_ROLE_LABEL, type TeamMember } from "@/lib/types/team.types"
import { AddMemberModal } from "./add-member-modal"
import { ResetPasswordModal } from "./reset-password-modal"
import { RemoveMemberModal } from "./remove-member-modal"
import { TeamMemberRow } from "./team-member-row"

export function CompanyTeamScreen() {
  const { team, isLoading, error, refetch } = useTeam()
  const [adding, setAdding] = useState(false)
  const [resetting, setResetting] = useState<TeamMember | null>(null)
  const [removing, setRemoving] = useState<TeamMember | null>(null)

  const isOwner = team?.meuPapel === "PROPRIETARIO"
  const canEdit = (member: TeamMember) =>
    Boolean(team?.podeGerenciar && member.memberId && !member.voce && (member.role !== "ADMIN" || isOwner))

  const invitedCount = team ? team.membros.length - 1 : 0

  return (
    <PageShell>
      <PageHeader
        eyebrow="Configurações"
        title="Equipe"
        description="Dê acesso à plataforma para outras pessoas da empresa. Todos gerenciam as mesmas vagas, candidaturas e conversas."
        actions={
          team?.podeGerenciar && (
            <button type="button" onClick={() => setAdding(true)} className="btn-primary">
              <UserPlus className="size-4" aria-hidden />
              Adicionar pessoa
            </button>
          )
        }
      />

      <div className="mt-8 flex flex-col gap-4">
        {isLoading && <CardSkeleton rows={3} />}

        {error && (
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => void refetch()} className="btn-secondary">
                Tentar novamente
              </button>
            }
          />
        )}

        {team && !team.podeGerenciar && (
          <Alert>
            Você entrou como <strong>{TEAM_ROLE_LABEL[team.meuPapel]}</strong>. Só o proprietário e
            administradores podem adicionar ou alterar acessos.
          </Alert>
        )}

        {team && (
          <section aria-labelledby="team-heading" className="rounded-card border border-border bg-card">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 id="team-heading" className="text-sm font-semibold text-foreground">
                Pessoas com acesso
              </h2>
              <span className="text-xs text-muted-foreground">
                {team.membros.length} {team.membros.length === 1 ? "pessoa" : "pessoas"}
              </span>
            </header>

            <ul className="divide-y divide-border">
              {team.membros.map((member) => (
                <TeamMemberRow
                  key={member.userId}
                  member={member}
                  editable={canEdit(member)}
                  canGrantAdmin={isOwner}
                  onResetPassword={() => setResetting(member)}
                  onRemove={() => setRemoving(member)}
                />
              ))}
            </ul>
          </section>
        )}

        {team && invitedCount === 0 && team.podeGerenciar && (
          <EmptyState
            icon={UsersRound}
            title="Ninguém convidado ainda"
            description="Crie um acesso com e-mail e senha para recrutadores ou gestores da sua empresa."
            action={
              <button type="button" onClick={() => setAdding(true)} className="btn-secondary">
                <UserPlus className="size-4" aria-hidden />
                Adicionar primeira pessoa
              </button>
            }
          />
        )}
      </div>

      <AddMemberModal open={adding} onClose={() => setAdding(false)} canGrantAdmin={isOwner} />
      <ResetPasswordModal member={resetting} onClose={() => setResetting(null)} />
      <RemoveMemberModal member={removing} onClose={() => setRemoving(null)} />
    </PageShell>
  )
}
