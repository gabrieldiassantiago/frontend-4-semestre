"use client"

import { useEffect, useState } from "react"
import { Code2, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Field } from "@/components/ui/form-field"
import { Alert, EmptyState } from "@/components/ui/states"
import {
  useAddCandidateProject,
  useDeleteCandidateProject,
  useUpdateCandidateProject,
} from "@/lib/queries/use-candidate-profile"
import type {
  CandidateProfile,
  CandidateProject,
  CreateProjectDto,
} from "@/lib/types/candidate.types"
import { isWebUrl } from "@/lib/utils/profile-validation"
import { SkillsInput } from "./skills-input"
import { messageFrom } from "./profile-form.utils"

type Rascunho = CreateProjectDto & { id?: string }

const VAZIO: Rascunho = {
  title: "",
  description: "",
  projectUrl: "",
  toolsAndSkills: [],
}

/** CRUD de projetos. Mesma mecânica do editor de experiências. */
export function ProjectEditor({
  projects,
  onProfileChange,
  onEditingChange,
}: {
  projects: CandidateProject[]
  onProfileChange: (profile: CandidateProfile) => void
  onEditingChange?: (editing: boolean) => void
}) {
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const addProject = useAddCandidateProject()
  const updateProject = useUpdateCandidateProject()
  const deleteProject = useDeleteCandidateProject()
  const saving = addProject.isPending || updateProject.isPending
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

    const errors: Record<string, string> = {}
    if (!rascunho.title.trim()) errors.title = "Dê um nome ao seu projeto."
    if (rascunho.projectUrl?.trim() && !isWebUrl(rascunho.projectUrl.trim())) errors.projectUrl = "Informe um link válido começando com https://."
    setFieldErrors(errors)
    if (Object.keys(errors).length) { setErro("Revise os campos destacados."); return }

    setErro(null)

    const dto: CreateProjectDto = {
      title: rascunho.title.trim(),
      description: rascunho.description?.trim() || undefined,
      projectUrl: rascunho.projectUrl?.trim() || undefined,
      toolsAndSkills: rascunho.toolsAndSkills?.length ? rascunho.toolsAndSkills : undefined,
    }

    try {
      const atualizado = rascunho.id
        ? await updateProject.mutateAsync({ id: rascunho.id, dto })
        : await addProject.mutateAsync(dto)
      onProfileChange(atualizado)
      setRascunho(null)
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível salvar o projeto."))
    }
  }

  async function remover(id: string) {
    if (busy || rascunho) return
    setRemovendo(id)
    setErro(null)
    try {
      onProfileChange(await deleteProject.mutateAsync(id))
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível remover o projeto."))
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert tone="danger">{erro}</Alert>}

      {projects.length === 0 && !rascunho ? (
        <EmptyState
          icon={Code2}
          title="Nenhum projeto adicionado"
          description="Projetos são a forma mais rápida de provar o que você sabe fazer, mesmo sem experiência formal."
          action={
            <button type="button" onClick={() => { setErro(null); setFieldErrors({}); setRascunho({ ...VAZIO }) }} className="btn-primary">
              <Plus className="size-4" aria-hidden />
              Adicionar projeto
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-nowrap"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
                <Code2 className="size-5" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-foreground text-pretty">{item.title}</h4>
                {item.description && (
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground text-pretty">
                    {item.description}
                  </p>
                )}

                {item.toolsAndSkills && item.toolsAndSkills.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.toolsAndSkills.map((tool) => (
                      <Badge key={tool} variant="outline" size="sm">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}

                {item.projectUrl && (
                  <a
                    href={item.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    Ver projeto
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`Editar projeto ${item.title}`}
                  onClick={() =>
                    setRascunho({
                      id: item.id,
                      title: item.title,
                      description: item.description ?? "",
                      projectUrl: item.projectUrl ?? "",
                      toolsAndSkills: item.toolsAndSkills ?? [],
                    })
                  }
                  disabled={busy || Boolean(rascunho)}
                  className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Remover projeto ${item.title}`}
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
        <section aria-label="Formulário de projeto" className="overflow-hidden rounded-2xl border border-primary/25 bg-card p-5 shadow-sm sm:p-6">
          <fieldset disabled={busy} className="min-w-0">
          <h4 className="text-lg font-bold tracking-tight text-foreground">
            {rascunho.id ? "Editar projeto" : "Novo projeto"}
          </h4>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">Mostre uma iniciativa que você realizou e qual foi sua contribuição.</p>
          <p className="mt-3 text-xs text-muted-foreground">* Campo obrigatório · salvo ao clicar no botão abaixo.</p>
          <div className="mt-6 flex flex-col gap-5">
            <Field label="Nome do projeto *" error={fieldErrors.title}>
              <input
                className="field-input"
                aria-invalid={Boolean(fieldErrors.title)}
                value={rascunho.title}
                onChange={(event) => setRascunho({ ...rascunho, title: event.target.value })}
                placeholder="Ex.: Campanha de arrecadação da comunidade"
              />
            </Field>

            <Field label="Descrição" hint="Opcional. Qual problema o projeto resolve?">
              <textarea
                rows={4}
                className="field-input resize-y"
                value={rascunho.description ?? ""}
                onChange={(event) => setRascunho({ ...rascunho, description: event.target.value })}
                placeholder="Ex.: Organizei uma equipe de voluntários e a distribuição de doações para 40 famílias."
              />
            </Field>

            <Field error={fieldErrors.projectUrl} label="Link do projeto" hint="Opcional. Repositório, demo ou publicação.">
              <input
                type="url"
                className="field-input"
                aria-invalid={Boolean(fieldErrors.projectUrl)}
                value={rascunho.projectUrl ?? ""}
                onChange={(event) => setRascunho({ ...rascunho, projectUrl: event.target.value })}
                placeholder="https://seu-site.com/meu-trabalho"
              />
            </Field>

            <Field label="Tecnologias e habilidades" hint="Opcional.">
              <SkillsInput
                skills={rascunho.toolsAndSkills ?? []}
                onChange={(toolsAndSkills) => setRascunho({ ...rascunho, toolsAndSkills })}
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
              Salvar projeto
            </button>
          </div>
          </fieldset>
        </section>
      ) : (
        projects.length > 0 && (
          <button
            type="button"
            onClick={() => { setErro(null); setFieldErrors({}); setRascunho({ ...VAZIO }) }}
            className="btn-secondary w-full border-dashed py-4"
          >
            <Plus className="size-4" aria-hidden />
            Adicionar projeto
          </button>
        )
      )}
    </div>
  )
}
