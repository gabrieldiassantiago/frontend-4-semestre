"use client"

import { Select } from "@/components/ui/select"
import { useState } from "react"
import { ExternalLink, Languages, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toastSuccess } from "@/lib/toast"
import { Field } from "@/components/ui/form-field"
import { Alert, EmptyState } from "@/components/ui/states"
import {
  useAddCandidateLanguage,
  useDeleteCandidateLanguage,
  useDeleteCandidateLanguageCertificate,
  useUpdateCandidateLanguage,
  useUploadCandidateLanguageCertificate,
} from "@/lib/queries/use-candidate-profile"
import type {
  CandidateLanguage,
  CreateLanguageDto,
  LanguageProficiency,
} from "@/lib/types/candidate.types"
import { attachmentHref } from "@/lib/utils/attachment"
import { AttachmentField } from "./attachment-field"
import { messageFrom } from "./profile-form.utils"

export const PROFICIENCY_OPTIONS: { value: LanguageProficiency; label: string }[] = [
  { value: "BASICO", label: "Básico" },
  { value: "INTERMEDIARIO", label: "Intermediário" },
  { value: "AVANCADO", label: "Avançado" },
  { value: "FLUENTE", label: "Fluente" },
  { value: "NATIVO", label: "Nativo" },
]

const SUGESTOES = ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Libras", "Mandarim"]

const proficiencyLabel = (value: LanguageProficiency) =>
  PROFICIENCY_OPTIONS.find((option) => option.value === value)?.label ?? value

interface Rascunho {
  id?: string
  language: string
  proficiency: LanguageProficiency | ""
}

const VAZIO: Rascunho = { language: "", proficiency: "" }

export function LanguageEditor({
  languages,
  onEditingChange,
}: {
  languages: CandidateLanguage[]
  onEditingChange?: (editing: boolean) => void
}) {
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [staged, setStaged] = useState<File | null>(null)
  const [removeFile, setRemoveFile] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Rascunho, string>>>({})
  const [removendo, setRemovendo] = useState<string | null>(null)

  const addLanguage = useAddCandidateLanguage()
  const updateLanguage = useUpdateCandidateLanguage()
  const uploadFile = useUploadCandidateLanguageCertificate()
  const deleteFile = useDeleteCandidateLanguageCertificate()
  const deleteLanguage = useDeleteCandidateLanguage()

  const saving = addLanguage.isPending || updateLanguage.isPending || uploadFile.isPending || deleteFile.isPending
  const busy = saving || removendo !== null
  const formOpen = Boolean(rascunho)

  function setEditing(next: Rascunho | null) {
    setRascunho(next)
    setStaged(null)
    setRemoveFile(false)
    setErro(null)
    setFieldErrors({})
    onEditingChange?.(next !== null)
  }

  function openForm(item?: CandidateLanguage) {
    setEditing(item ? { id: item.id, language: item.language, proficiency: item.proficiency } : { ...VAZIO })
  }

  function validate(data: Rascunho) {
    const errors: Partial<Record<keyof Rascunho, string>> = {}
    const name = data.language.trim()
    if (!name) errors.language = "Informe o idioma."
    else if (name.length > 100) errors.language = "Use no máximo 100 caracteres."
    if (!data.proficiency) errors.proficiency = "Escolha o nível."
    return errors
  }

  async function salvar() {
    if (!rascunho || busy) return
    const errors = validate(rascunho)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro("Revise os campos destacados.")
      return
    }

    const dto: CreateLanguageDto = {
      language: rascunho.language.trim(),
      proficiency: rascunho.proficiency as LanguageProficiency,
    }

    setErro(null)
    let saved: CandidateLanguage
    try {
      saved = rascunho.id
        ? await updateLanguage.mutateAsync({ id: rascunho.id, dto })
        : await addLanguage.mutateAsync(dto)
      setRascunho((atual) => (atual ? { ...atual, id: saved.id } : atual))
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível salvar o idioma."))
      return
    }

    try {
      if (staged) saved = await uploadFile.mutateAsync({ id: saved.id, file: staged })
      else if (removeFile && saved.certificateUrl) saved = await deleteFile.mutateAsync(saved.id)
    } catch (error) {
      setStaged(null)
      setRemoveFile(false)
      setErro(`Os dados foram salvos, mas o certificado não. ${messageFrom(error, "Tente enviar novamente.")}`)
      return
    }

    const wasEditing = Boolean(rascunho.id)
    setEditing(null)
    toastSuccess(wasEditing ? "Idioma atualizado!" : "Idioma adicionado!")
  }

  async function remover(item: CandidateLanguage) {
    if (busy || formOpen) return
    setRemovendo(item.id)
    setErro(null)
    try {
      await deleteLanguage.mutateAsync(item.id)
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível remover o idioma."))
    } finally {
      setRemovendo(null)
    }
  }

  const atual = rascunho?.id ? languages.find((item) => item.id === rascunho.id) : undefined

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert tone="danger">{erro}</Alert>}

      {languages.length === 0 && !formOpen ? (
        <EmptyState
          icon={Languages}
          title="Nenhum idioma adicionado"
          description="Idiomas estrangeiros ou Libras podem ser relevantes para a vaga. Pode pular se preferir."
          action={
            <button type="button" onClick={() => openForm()} className="btn-primary">
              <Plus className="size-4" aria-hidden />
              Adicionar idioma
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {languages.map((item) => {
            const certificateHref = attachmentHref(item.certificateUrl)
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-3xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40 sm:flex-nowrap">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
                  <Languages className="size-5" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-foreground">{item.language}</h4>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{proficiencyLabel(item.proficiency)}</p>
                  {certificateHref && (
                    <a href={certificateHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      {item.certificateFileName ?? "Certificado de conclusão"}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Editar idioma ${item.language}`}
                    onClick={() => openForm(item)}
                    disabled={busy || formOpen}
                    className="grid size-10 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover idioma ${item.language}`}
                    onClick={() => remover(item)}
                    disabled={busy || formOpen}
                    className="grid size-10 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-transparent hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-50"
                  >
                    {removendo === item.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {rascunho ? (
        <section aria-label="Formulário de idioma" className="overflow-hidden rounded-3xl border border-primary/30 bg-card p-5 sm:p-6">
          <fieldset disabled={busy} className="min-w-0">
            <h4 className="text-lg font-bold tracking-tight text-foreground">
              {rascunho.id ? "Editar idioma" : "Novo idioma"}
            </h4>
            <p className="mt-3 text-xs text-muted-foreground">* Campo obrigatório · salvo ao clicar no botão abaixo.</p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Idioma *" error={fieldErrors.language} hint="Escolha uma sugestão ou digite outro.">
                <input
                  className="field-input"
                  list="language-suggestions"
                  aria-invalid={Boolean(fieldErrors.language)}
                  maxLength={100}
                  value={rascunho.language}
                  onChange={(event) => setRascunho({ ...rascunho, language: event.target.value })}
                  placeholder="Ex.: Inglês, Japonês"
                />
                <datalist id="language-suggestions">
                  {SUGESTOES.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>

              <Field label="Nível *" error={fieldErrors.proficiency}>
                <Select
                  id="language-proficiency"
                  aria-label="Nível do idioma"
                  placeholder="Selecione o nível"
                  invalid={Boolean(fieldErrors.proficiency)}
                  value={rascunho.proficiency}
                  onValueChange={(value) => setRascunho({ ...rascunho, proficiency: value as LanguageProficiency })}
                  options={PROFICIENCY_OPTIONS}
                />
              </Field>

              <AttachmentField
                label="Certificado de conclusão"
                hint="Opcional. Ex.: TOEFL, Cambridge, DELE. PDF, PNG ou JPEG."
                existingName={atual?.certificateFileName}
                existingHref={attachmentHref(atual?.certificateUrl)}
                removed={removeFile}
                onRemovedChange={setRemoveFile}
                staged={staged}
                onStagedChange={setStaged}
                disabled={busy}
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost" disabled={busy}>
                Cancelar
              </button>
              <button type="button" onClick={salvar} className="btn-primary" disabled={busy}>
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Salvar idioma
              </button>
            </div>
          </fieldset>
        </section>
      ) : (
        languages.length > 0 && (
          <button type="button" onClick={() => openForm()} className="btn-secondary w-full !rounded-3xl border-dashed py-4">
            <Plus className="size-4" aria-hidden />
            Adicionar idioma
          </button>
        )
      )}
    </div>
  )
}
