"use client"

import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Field } from "@/components/ui/form-field"
import { PasswordInput } from "@/components/ui/password-input"
import { Alert } from "@/components/ui/states"
import { getErrorMessage } from "@/lib/errors"
import { useUpdateTeamMember } from "@/lib/queries/use-team"
import type { TeamMember } from "@/lib/types/team.types"

const FORM_ID = "reset-member-password-form"

export function ResetPasswordModal({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  const update = useUpdateTeamMember()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setPassword("")
    setError(null)
    onClose()
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!member?.memberId) return
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      return
    }
    try {
      await update.mutateAsync({ memberId: member.memberId, dto: { password } })
      close()
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível alterar a senha."))
    }
  }

  return (
    <Modal
      open={Boolean(member)}
      onClose={close}
      size="sm"
      title="Definir nova senha"
      description={member ? `A senha atual de ${member.name} deixa de funcionar.` : undefined}
      footer={
        <>
          <button type="button" onClick={close} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" form={FORM_ID} disabled={update.isPending} className="btn-primary">
            {update.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Salvar senha
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="Nova senha" hint="Mínimo de 8 caracteres.">
          <PasswordInput
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
      </form>
    </Modal>
  )
}
