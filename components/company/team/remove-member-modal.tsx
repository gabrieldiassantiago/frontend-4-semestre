"use client"

import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Alert } from "@/components/ui/states"
import { getErrorMessage } from "@/lib/errors"
import { useRemoveTeamMember } from "@/lib/queries/use-team"
import type { TeamMember } from "@/lib/types/team.types"

export function RemoveMemberModal({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  const remove = useRemoveTeamMember()
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setError(null)
    onClose()
  }

  const confirmRemove = async () => {
    if (!member) return
    setError(null)
    try {
      await remove.mutateAsync(member.userId)
      close()
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível remover."))
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
          <button
            type="button"
            onClick={() => void confirmRemove()}
            disabled={remove.isPending}
            className="btn-primary bg-danger hover:bg-danger"
          >
            {remove.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Remover
          </button>
        </>
      }
    >
      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Essa ação não pode ser desfeita. Para devolver o acesso, será preciso criar a conta novamente.
        </p>
      )}
    </Modal>
  )
}
