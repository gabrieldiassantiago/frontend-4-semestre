"use client"

import { useEffect, useState } from "react"
import { BriefcaseBusiness, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Field } from "@/components/ui/form-field"
import { Alert, EmptyState } from "@/components/ui/states"
import {
  useAddCandidateExperience,
  useDeleteCandidateExperience,
  useUpdateCandidateExperience,
} from "@/lib/queries/use-candidate-profile"
function formatExperienceMonth(value: string) {
  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return "—"
  return new Intl.DateTimeFormat("pt-BR", {month:"short", year:"numeric"}).format(new Date(Number(match[1]), Number(match[2]) - 1, 1))
}
import type {
  CandidateExperience,
  CandidateProfile,
  CreateExperienceDto,
} from "@/lib/types/candidate.types"
import { validateExperience } from "@/lib/utils/profile-validation"
import { messageFrom } from "./profile-form.utils"

type Rascunho = CreateExperienceDto & { id?: string }

const VAZIO: Rascunho = {
  companyName: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
}

/** Datas da API vêm como ISO; o input[type=month] usa AAAA-MM. */
function paraMes(valor?: string) {
  return valor ? valor.slice(0, 7) : ""
}

function periodo(item: CandidateExperience) {
  const inicio = formatExperienceMonth(item.startDate)
  const fim = item.isCurrent ? "Atual" : item.endDate ? formatExperienceMonth(item.endDate) : "—"
  return `${inicio} · ${fim}`
}

/**
 * CRUD de experiências. Todas as rotas devolvem o perfil inteiro, então o
 * componente só repassa o resultado para o pai em vez de manter cópia local.
 */
export function ExperienceEditor({
  experiences,
  onProfileChange,
  onEditingChange,
}: {
  experiences: CandidateExperience[]
  onProfileChange: (profile: CandidateProfile) => void
  onEditingChange?: (editing: boolean) => void
}) {
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const addExperience = useAddCandidateExperience()
  const updateExperience = useUpdateCandidateExperience()
  const deleteExperience = useDeleteCandidateExperience()
  const saving = addExperience.isPending || updateExperience.isPending
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const busy = saving || removendo !== null
  useEffect(() => {
    onEditingChange?.(Boolean(rascunho) || busy)
    return () => onEditingChange?.(false)
  }, [Boolean(rascunho), busy, onEditingChange])

  async function salvar() {
    if (!rascunho || busy) return

    const now = new Date()
    const currentMonth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0")
    const errors = validateExperience(rascunho, currentMonth)
    setFieldErrors(errors)
    if (Object.keys(errors).length) { setErro("Revise os campos destacados."); return }

    setErro(null)

    const dto: CreateExperienceDto = {
      companyName: rascunho.companyName.trim(),
      role: rascunho.role.trim(),
      description: rascunho.description?.trim() || undefined,
      startDate: `${rascunho.startDate}-01`,
      endDate: rascunho.isCurrent || !rascunho.endDate ? undefined : `${rascunho.endDate}-01`,
      isCurrent: rascunho.isCurrent,
    }

    try {
      const atualizado = rascunho.id
        ? await updateExperience.mutateAsync({ id: rascunho.id, dto })
        : await addExperience.mutateAsync(dto)
      onProfileChange(atualizado)
      setRascunho(null)
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível salvar a experiência."))
    }
  }

  async function remover(id: string) {
    if (busy || rascunho) return
    setRemovendo(id)
    setErro(null)
    try {
      onProfileChange(await deleteExperience.mutateAsync(id))
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível remover a experiência."))
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert tone="danger">{erro}</Alert>}

      {experiences.length === 0 && !rascunho ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Nenhuma experiência adicionada"
          description="Estágios, trabalhos formais, voluntariado e projetos acadêmicos contam como experiência."
          action={
            <button type="button" onClick={() => { setErro(null); setFieldErrors({}); setRascunho({ ...VAZIO }) }} className="btn-primary">
              <Plus className="size-4" aria-hidden />
              Adicionar experiência
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {experiences.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-nowrap"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
                <BriefcaseBusiness className="size-5" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-foreground text-pretty">{item.role}</h4>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {item.companyName}
                </p>
                <p className="mt-1 text-xs text-subtle-foreground">{periodo(item)}</p>
                {item.description && (
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground text-pretty">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`Editar experiência ${item.role}`}
                  onClick={() =>
                    setRascunho({
                      id: item.id,
                      companyName: item.companyName,
                      role: item.role,
                      description: item.description ?? "",
                      startDate: paraMes(item.startDate),
                      endDate: paraMes(item.endDate),
                      isCurrent: item.isCurrent,
                    })
                  }
                  disabled={busy || Boolean(rascunho)}
                  className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Remover experiência ${item.role}`}
                  onClick={() => remover(item.id)}
                  disabled={busy || Boolean(rascunho)}
                  className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-50"
                >
                  {removendo === item.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rascunho ? (
        <section aria-label="Formulário de experiência" className="overflow-hidden rounded-2xl border border-primary/25 bg-card p-5 shadow-sm sm:p-6">
          <fieldset disabled={busy} className="min-w-0">
          <h4 className="text-lg font-bold tracking-tight text-foreground">
            {rascunho.id ? "Editar experiência" : "Nova experiência"}
          </h4>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">Conte onde você atuou e como contribuiu. Estágio e voluntariado também valem.</p>
          <p className="mt-3 text-xs text-muted-foreground">* Campo obrigatório · salvo ao clicar no botão abaixo.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Empresa ou organização *" error={fieldErrors.companyName}>
              <input
                className="field-input"
                aria-invalid={Boolean(fieldErrors.companyName)}
                value={rascunho.companyName}
                onChange={(event) =>
                  setRascunho({ ...rascunho, companyName: event.target.value })
                }
                placeholder="Ex.: Hospital Santa Casa, Loja Central"
              />
            </Field>

            <Field label="Cargo ou atividade *" error={fieldErrors.role}>
              <input
                className="field-input"
                aria-invalid={Boolean(fieldErrors.role)}
                value={rascunho.role}
                onChange={(event) => setRascunho({ ...rascunho, role: event.target.value })}
                placeholder="Ex.: Assistente de vendas"
              />
            </Field>

            <Field label="Data de início *" error={fieldErrors.startDate}>
              <input
                type="month"
                min="1900-01"
                max={new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0")}
                className="field-input"
                aria-invalid={Boolean(fieldErrors.startDate)}
                value={rascunho.startDate}
                onChange={(event) => setRascunho({ ...rascunho, startDate: event.target.value })}
              />
            </Field>

            <Field error={fieldErrors.endDate} label="Data de término" hint={rascunho.isCurrent ? "Desativado: é o seu trabalho atual." : undefined}>
              <input
                type="month"
                min="1900-01"
                max={new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0")}
                className="field-input"
                aria-invalid={Boolean(fieldErrors.endDate)}
                value={rascunho.endDate ?? ""}
                disabled={rascunho.isCurrent}
                onChange={(event) => setRascunho({ ...rascunho, endDate: event.target.value })}
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-4 sm:col-span-2">
              <input
                type="checkbox"
                checked={rascunho.isCurrent}
                onChange={(event) =>
                  setRascunho({
                    ...rascunho,
                    isCurrent: event.target.checked,
                    endDate: event.target.checked ? "" : rascunho.endDate,
                  })
                }
                className="size-4 rounded border-border-strong accent-primary"
              />
              <span className="text-sm font-semibold text-strong-foreground">
                Ainda trabalho aqui
              </span>
            </label>

            <Field label="O que você fazia" wide hint="Opcional. Foque em resultados e ferramentas.">
              <textarea
                rows={4}
                className="field-input resize-y"
                value={rascunho.description ?? ""}
                onChange={(event) =>
                  setRascunho({ ...rascunho, description: event.target.value })
                }
                placeholder="Ex.: Organizei o atendimento e ajudei a reduzir o tempo de espera dos clientes."
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => { setRascunho(null); setErro(null); setFieldErrors({}) }}
              className="btn-ghost"
              disabled={busy}
            >
              Cancelar
            </button>
            <button type="button" onClick={salvar} className="btn-primary" disabled={busy}>
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Salvar experiência
            </button>
          </div>
          </fieldset>
        </section>
      ) : (
        experiences.length > 0 && (
          <button
            type="button"
            onClick={() => { setErro(null); setFieldErrors({}); setRascunho({ ...VAZIO }) }}
            className="btn-secondary w-full border-dashed py-4"
          >
            <Plus className="size-4" aria-hidden />
            Adicionar experiência
          </button>
        )
      )}
    </div>
  )
}
