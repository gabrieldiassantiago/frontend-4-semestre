"use client"

import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Alert } from "@/components/ui/states"
import { getErrorMessage, isApiError } from "@/lib/errors"
import { useRemoveTeamMember, useUpdateTeamMember } from "@/lib/queries/use-team"
import type { TeamMember } from "@/lib/types/team.types"

export function RemoveMemberModal({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  const remove = useRemoveTeamMember()
  const update = useUpdateTeamMember()
  const [error, setError] = useState<string | null>(null)
  const [hasHistory, setHasHistory] = useState(false)
  const busy = remove.isPending || update.isPending

  const close = () => {
    setError(null)
    setHasHistory(false)
    onClose()
  }

  const confirmRemove = async () => {
    if (!member?.memberId) return
    setError(null)
    try {
      await remove.mutateAsync(member.memberId)
      close()
    } catch (err) {
      setHasHistory(isApiError(err, 409))
      setError(getErrorMessage(err, "Não foi possível remover."))
    }
  }

  const deactivate = async () => {
    if (!member?.memberId) return
    try {
      await update.mutateAsync({ memberId: member.memberId, dto: { active: false } })
      close()
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível desativar."))
    }
  }

  return (
    <Modal
      open={Boolean(member)}
      onClose={close}
      size="sm"
      title={member ? `Remover ${member.name}?` : "Remover membro"}
      description="A conta é excluída e a pessoa perde o acesso à empresa imediatamente."
      footer={
        <>
          <button type="button" onClick={close} className="btn-secondary">
            Cancelar
          </button>
          {hasHistory ? (
            <button type="button" onClick={() => void deactivate()} disabled={busy} className="btn-primary">
              {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              Desativar acesso
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void confirmRemove()}
              disabled={busy}
              className="btn-primary bg-danger hover:bg-danger"
            >
              {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              Remover
            </button>
          )}
        </>
      }
    >
      {error ? (
        <Alert tone={hasHistory ? "info" : "danger"}>{error}</Alert>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Se preferir manter o histórico de mensagens e feedbacks, use <strong>Desativar</strong> na lista.
        </p>
      )}
    </Modal>
  )
}
