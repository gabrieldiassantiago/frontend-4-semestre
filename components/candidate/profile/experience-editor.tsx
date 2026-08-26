"use client"

import { useState } from "react"
import { BriefcaseBusiness, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Field } from "@/components/ui/form-field"
import { Alert, EmptyState } from "@/components/ui/states"
import {
  addCandidateExperience,
  deleteCandidateExperience,
  updateCandidateExperience,
} from "@/lib/services/candidate.service"
import { formatDate } from "@/lib/format"
import type {
  CandidateExperience,
  CandidateProfile,
  CreateExperienceDto,
} from "@/lib/types/candidate.types"
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
  const inicio = formatDate(item.startDate)
  const fim = item.isCurrent ? "Atual" : item.endDate ? formatDate(item.endDate) : "—"
  return `${inicio} · ${fim}`
}

/**
 * CRUD de experiências. Todas as rotas devolvem o perfil inteiro, então o
 * componente só repassa o resultado para o pai em vez de manter cópia local.
 */
export function ExperienceEditor({
  experiences,
  onProfileChange,
}: {
  experiences: CandidateExperience[]
  onProfileChange: (profile: CandidateProfile) => void
}) {
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [saving, setSaving] = useState(false)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    if (!rascunho) return

    if (!rascunho.companyName.trim() || !rascunho.role.trim() || !rascunho.startDate) {
      setErro("Empresa, cargo e data de início são obrigatórios.")
      return
    }

    setSaving(true)
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
        ? await updateCandidateExperience(rascunho.id, dto)
        : await addCandidateExperience(dto)
      onProfileChange(atualizado)
      setRascunho(null)
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível salvar a experiência."))
    } finally {
      setSaving(false)
    }
  }

  async function remover(id: string) {
    setRemovendo(id)
    setErro(null)
    try {
      onProfileChange(await deleteCandidateExperience(id))
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
            <button type="button" onClick={() => setRascunho(VAZIO)} className="btn-primary">
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
              className="flex items-start gap-4 rounded-card border border-border bg-card p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-strong-foreground">
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
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Remover experiência ${item.role}`}
                  onClick={() => remover(item.id)}
                  disabled={removendo === item.id}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-50"
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
        <section className="rounded-card border border-border bg-muted/50 p-5">
          <h4 className="text-sm font-bold text-foreground">
            {rascunho.id ? "Editar experiência" : "Nova experiência"}
          </h4>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Empresa ou organização">
              <input
                className="field-input"
                value={rascunho.companyName}
                onChange={(event) =>
                  setRascunho({ ...rascunho, companyName: event.target.value })
                }
                placeholder="Ex.: Vercel"
              />
            </Field>

            <Field label="Cargo">
              <input
                className="field-input"
                value={rascunho.role}
                onChange={(event) => setRascunho({ ...rascunho, role: event.target.value })}
                placeholder="Ex.: Estagiário de Front-end"
              />
            </Field>

            <Field label="Início">
              <input
                type="month"
                className="field-input"
                value={rascunho.startDate}
                onChange={(event) => setRascunho({ ...rascunho, startDate: event.target.value })}
              />
            </Field>

            <Field label="Término" hint={rascunho.isCurrent ? "Desativado: é o seu trabalho atual." : undefined}>
              <input
                type="month"
                className="field-input"
                value={rascunho.endDate ?? ""}
                disabled={rascunho.isCurrent}
                onChange={(event) => setRascunho({ ...rascunho, endDate: event.target.value })}
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
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
                placeholder="Ex.: Desenvolvi telas em React e reduzi o tempo de carregamento em 30%."
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRascunho(null)}
              className="btn-ghost"
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="button" onClick={salvar} className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Salvar experiência
            </button>
          </div>
        </section>
      ) : (
        experiences.length > 0 && (
          <button
            type="button"
            onClick={() => setRascunho(VAZIO)}
            className="btn-secondary self-start"
          >
            <Plus className="size-4" aria-hidden />
            Adicionar experiência
          </button>
        )
      )}
    </div>
  )
}
