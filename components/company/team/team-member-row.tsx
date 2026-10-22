"use client"

import { useState } from "react"
import { KeyRound, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { getErrorMessage } from "@/lib/errors"
import { useUpdateTeamMember } from "@/lib/queries/use-team"
import { TEAM_ROLE_LABEL, type TeamMember, type TeamMemberRole } from "@/lib/types/team.types"

const ROLE_VARIANT = { ADMIN: "info", RECRUTADOR: "neutral" } as const

export function TeamMemberRow({
  member,
  editable,
  canChangeRole,
  onResetPassword,
  onRemove,
}: {
  member: TeamMember
  editable: boolean
  /** O backend só permite que o proprietário altere o papel de alguém. */
  canChangeRole: boolean
  onResetPassword: () => void
  onRemove: () => void
}) {
  const update = useUpdateTeamMember()
  const [error, setError] = useState<string | null>(null)

  const changeRole = async (role: TeamMemberRole) => {
    setError(null)
    try {
      await update.mutateAsync({ userId: member.userId, dto: { role } })
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível atualizar o acesso."))
    }
  }

  return (
    <li className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <EntityAvatar name={member.name} size="md" className={member.active ? undefined : "opacity-50"} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
            <span className="truncate">{member.name}</span>
            {member.voce && <span className="text-xs font-normal text-muted-foreground">(você)</span>}
          </p>
          <p className="truncate text-sm text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {editable && canChangeRole ? (
          <label className="flex items-center gap-2">
            <span className="sr-only">Papel de {member.name}</span>
            <select
              value={member.role}
              disabled={update.isPending}
              onChange={(event) => void changeRole(event.target.value as TeamMemberRole)}
              className="field-input h-9 w-auto py-0 pr-8 text-sm"
            >
              <option value="RECRUTADOR">{TEAM_ROLE_LABEL.RECRUTADOR}</option>
              <option value="ADMIN">{TEAM_ROLE_LABEL.ADMIN}</option>
            </select>
          </label>
        ) : (
          <Badge variant={ROLE_VARIANT[member.role]}>{TEAM_ROLE_LABEL[member.role]}</Badge>
        )}

        {editable && (
          <>
            <button type="button" onClick={onResetPassword} className="btn-ghost h-9 px-3 text-sm">
              <KeyRound className="size-4" aria-hidden />
              Nova senha
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remover ${member.name}`}
              className="grid size-9 place-items-center rounded-full text-danger-foreground transition-colors hover:bg-danger-subtle"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-danger-foreground lg:basis-full">
          {error}
        </p>
      )}
    </li>
  )
}
