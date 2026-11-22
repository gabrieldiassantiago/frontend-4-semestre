"use client"

import { useState } from "react"
import { Award, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toastSuccess } from "@/lib/toast"
import { Field } from "@/components/ui/form-field"
import { Alert, EmptyState } from "@/components/ui/states"
import {
  useAddCandidateCertificate,
  useDeleteCandidateCertificate,
  useDeleteCandidateCertificateFile,
  useUpdateCandidateCertificate,
  useUploadCandidateCertificateFile,
} from "@/lib/queries/use-candidate-profile"
import type { CandidateCertificate, CreateCertificateDto } from "@/lib/types/candidate.types"
import { attachmentHref } from "@/lib/utils/attachment"
import { AttachmentField } from "./attachment-field"
import { messageFrom } from "./profile-form.utils"

interface Rascunho {
  id?: string
  name: string
  issuer: string
  issueDate: string
  credentialUrl: string
}

const VAZIO: Rascunho = { name: "", issuer: "", issueDate: "", credentialUrl: "" }

function formatIssueDate(value: string) {
  const [year, month] = value.split("-")
  if (!year || !month) return "—"
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "")
}

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol)
  } catch {
    return false
  }
}

function validate(rascunho: Rascunho) {
  const errors: Partial<Record<keyof Rascunho, string>> = {}
  if (!rascunho.name.trim()) errors.name = "Informe o nome do certificado."
  else if (rascunho.name.trim().length > 255) errors.name = "Use no máximo 255 caracteres."
  if (!rascunho.issuer.trim()) errors.issuer = "Informe a instituição emissora."
  else if (rascunho.issuer.trim().length > 255) errors.issuer = "Use no máximo 255 caracteres."
  if (!rascunho.issueDate) errors.issueDate = "Informe a data de emissão."
  else if (rascunho.issueDate > todayIso()) errors.issueDate = "A data não pode estar no futuro."
  const url = rascunho.credentialUrl.trim()
  if (url && (url.length > 2048 || !isHttpUrl(url))) errors.credentialUrl = "Informe um link completo começando com https://."
  return errors
}

/**
 * CRUD de certificados. Dados e anexo são salvos em etapas: se o anexo falhar,
 * o certificado já existe e o formulário continua aberto para nova tentativa.
 */
export function CertificateEditor({
  certificates,
  onEditingChange,
}: {
  certificates: CandidateCertificate[]
  onEditingChange?: (editing: boolean) => void
}) {
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)
  const [staged, setStaged] = useState<File | null>(null)
  const [removeFile, setRemoveFile] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Rascunho, string>>>({})
  const [removendo, setRemovendo] = useState<string | null>(null)

  const addCertificate = useAddCandidateCertificate()
  const updateCertificate = useUpdateCandidateCertificate()
  const uploadFile = useUploadCandidateCertificateFile()
  const deleteFile = useDeleteCandidateCertificateFile()
  const deleteCertificate = useDeleteCandidateCertificate()

  const saving = addCertificate.isPending || updateCertificate.isPending || uploadFile.isPending || deleteFile.isPending
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

  function openForm(item?: CandidateCertificate) {
    setEditing(
      item
        ? {
            id: item.id,
            name: item.name,
            issuer: item.issuer,
            issueDate: item.issueDate,
            credentialUrl: item.credentialUrl ?? "",
          }
        : { ...VAZIO },
    )
  }

  async function salvar() {
    if (!rascunho || busy) return
    const errors = validate(rascunho)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro("Revise os campos destacados.")
      return
    }

    const dto: CreateCertificateDto = {
      name: rascunho.name.trim(),
      issuer: rascunho.issuer.trim(),
      issueDate: rascunho.issueDate,
      credentialUrl: rascunho.credentialUrl.trim() || null,
    }

    setErro(null)
    let saved: CandidateCertificate
    try {
      saved = rascunho.id
        ? await updateCertificate.mutateAsync({ id: rascunho.id, dto })
        : await addCertificate.mutateAsync(dto)
      // Passa a editar o mesmo item se o anexo falhar e o usuário tentar de novo.
      setRascunho((atual) => (atual ? { ...atual, id: saved.id } : atual))
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível salvar o certificado."))
      return
    }

    try {
      if (staged) saved = await uploadFile.mutateAsync({ id: saved.id, file: staged })
      else if (removeFile && saved.fileUrl) saved = await deleteFile.mutateAsync(saved.id)
    } catch (error) {
      setStaged(null)
      setRemoveFile(false)
      setErro(`Os dados foram salvos, mas o anexo não. ${messageFrom(error, "Tente enviar novamente.")}`)
      return
    }

    setEditing(null)
    toastSuccess(rascunho.id ? "Certificado atualizado!" : "Certificado adicionado!")
  }

  async function remover(item: CandidateCertificate) {
    if (busy || formOpen) return
    setRemovendo(item.id)
    setErro(null)
    try {
      await deleteCertificate.mutateAsync(item.id)
    } catch (error) {
      setErro(messageFrom(error, "Não foi possível remover o certificado."))
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert tone="danger">{erro}</Alert>}

      {certificates.length === 0 && !formOpen ? (
        <EmptyState
          icon={Award}
          title="Nenhum certificado adicionado"
          description="Cursos, certificações e credenciais que comprovam o que você sabe fazer."
          action={
            <button type="button" onClick={() => openForm()} className="btn-primary">
              <Plus className="size-4" aria-hidden />
              Adicionar certificado
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {certificates.map((item) => {
            const fileHref = attachmentHref(item.fileUrl)
            return (
              <li key={item.id} className="flex flex-wrap items-start gap-3 rounded-3xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40 sm:flex-nowrap">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
                  <Award className="size-5" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-foreground text-pretty">{item.name}</h4>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{item.issuer}</p>
                  <p className="mt-1 text-xs text-subtle-foreground">Emitido em {formatIssueDate(item.issueDate)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {item.credentialUrl && (
                      <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        Ver credencial
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    )}
                    {fileHref && (
                      <a href={fileHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        {item.fileName ?? "Abrir anexo"}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Editar certificado ${item.name}`}
                    onClick={() => openForm(item)}
                    disabled={busy || formOpen}
                    className="grid size-10 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover certificado ${item.name}`}
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
        <section aria-label="Formulário de certificado" className="overflow-hidden rounded-3xl border border-primary/30 bg-card p-5 sm:p-6">
          <fieldset disabled={busy} className="min-w-0">
            <h4 className="text-lg font-bold tracking-tight text-foreground">
              {rascunho.id ? "Editar certificado" : "Novo certificado"}
            </h4>
            <p className="mt-3 text-xs text-muted-foreground">* Campo obrigatório · salvo ao clicar no botão abaixo.</p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Nome do certificado *" error={fieldErrors.name} wide>
                <input
                  className="field-input"
                  aria-invalid={Boolean(fieldErrors.name)}
                  maxLength={255}
                  value={rascunho.name}
                  onChange={(event) => setRascunho({ ...rascunho, name: event.target.value })}
                  placeholder="Ex.: AWS Certified Cloud Practitioner"
                />
              </Field>

              <Field label="Instituição emissora *" error={fieldErrors.issuer}>
                <input
                  className="field-input"
                  aria-invalid={Boolean(fieldErrors.issuer)}
                  maxLength={255}
                  value={rascunho.issuer}
                  onChange={(event) => setRascunho({ ...rascunho, issuer: event.target.value })}
                  placeholder="Ex.: Coursera, SENAC, Alura"
                />
              </Field>

              <Field label="Data de emissão *" error={fieldErrors.issueDate}>
                <input
                  type="date"
                  max={todayIso()}
                  className="field-input"
                  aria-invalid={Boolean(fieldErrors.issueDate)}
                  value={rascunho.issueDate}
                  onChange={(event) => setRascunho({ ...rascunho, issueDate: event.target.value })}
                />
              </Field>

              <Field label="Link da credencial" error={fieldErrors.credentialUrl} hint="Opcional. Ajuda a empresa a validar o certificado." wide>
                <input
                  type="url"
                  className="field-input"
                  aria-invalid={Boolean(fieldErrors.credentialUrl)}
                  maxLength={2048}
                  value={rascunho.credentialUrl}
                  onChange={(event) => setRascunho({ ...rascunho, credentialUrl: event.target.value })}
                  placeholder="https://"
                />
              </Field>

              <AttachmentField
                label="Arquivo do certificado"
                hint="Opcional. Comprovante em PDF, PNG ou JPEG."
                existingName={rascunho.id ? certificates.find((item) => item.id === rascunho.id)?.fileName : null}
                existingHref={rascunho.id ? attachmentHref(certificates.find((item) => item.id === rascunho.id)?.fileUrl) : null}
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
                Salvar certificado
              </button>
            </div>
          </fieldset>
        </section>
      ) : (
        certificates.length > 0 && (
          <button type="button" onClick={() => openForm()} className="btn-secondary w-full !rounded-3xl border-dashed py-4">
            <Plus className="size-4" aria-hidden />
            Adicionar certificado
          </button>
        )
      )}
    </div>
  )
}
