"use client"

import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Field } from "@/components/ui/form-field"
import { PasswordInput } from "@/components/ui/password-input"
import { Alert } from "@/components/ui/states"
import { getErrorMessage } from "@/lib/errors"
import { useCreateTeamMember } from "@/lib/queries/use-team"
import { TEAM_ROLE_DESCRIPTION, TEAM_ROLE_LABEL, type CreateTeamMemberDto, type TeamMemberRole } from "@/lib/types/team.types"
import { cn } from "@/lib/utils"

const EMPTY: CreateTeamMemberDto = { name: "", email: "", password: "", role: "RECRUTADOR" }
const FORM_ID = "add-team-member-form"

export function AddMemberModal({
  open,
  onClose,
  canGrantAdmin,
}: {
  open: boolean
  onClose: () => void
  canGrantAdmin: boolean
}) {
  const create = useCreateTeamMember()
  const [form, setForm] = useState<CreateTeamMemberDto>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const roles: TeamMemberRole[] = canGrantAdmin ? ["RECRUTADOR", "ADMIN"] : ["RECRUTADOR"]

  const close = () => {
    setForm(EMPTY)
    setError(null)
    onClose()
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      return
    }
    try {
      await create.mutateAsync({ ...form, name: form.name.trim(), email: form.email.trim() })
      close()
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível criar o acesso."))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Adicionar pessoa à equipe"
      description="A pessoa entra em Empresa com este e-mail e senha. Compartilhe os dados por um canal seguro."
      footer={
        <>
          <button type="button" onClick={close} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" form={FORM_ID} disabled={create.isPending} className="btn-primary">
            {create.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Criar acesso
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="flex flex-col gap-5">
        {error && <Alert tone="danger">{error}</Alert>}

        <Field label="Nome">
          <input
            required
            autoComplete="off"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="field-input"
            placeholder="Ex.: Ana Souza"
          />
        </Field>

        <Field label="E-mail">
          <input
            required
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="field-input"
            placeholder="ana@empresa.com"
          />
        </Field>

        <Field label="Senha inicial" hint="Mínimo de 8 caracteres. A pessoa pode receber uma nova depois.">
          <PasswordInput
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-strong-foreground">Papel</legend>
          <div className="flex flex-col gap-2">
            {roles.map((role) => (
              <label
                key={role}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                  form.role === role ? "border-primary bg-primary-subtle" : "border-border hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={() => setForm({ ...form, role })}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{TEAM_ROLE_LABEL[role]}</span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {TEAM_ROLE_DESCRIPTION[role]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
