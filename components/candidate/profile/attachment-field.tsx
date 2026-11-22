"use client"

import { useRef, useState } from "react"
import { ExternalLink, FileText, Paperclip, RotateCcw, Trash2, X } from "lucide-react"
import { Field } from "@/components/ui/form-field"
import { ATTACHMENT_ACCEPT, validateAttachment } from "@/lib/utils/attachment"

interface AttachmentFieldProps {
  label: string
  hint?: string
  /** Nome e link do anexo já salvo no item (se houver). */
  existingName?: string | null
  existingHref?: string | null
  /** Anexo salvo marcado para remoção ao confirmar o formulário. */
  removed: boolean
  onRemovedChange: (removed: boolean) => void
  /** Arquivo escolhido neste formulário, enviado ao confirmar. */
  staged: File | null
  onStagedChange: (file: File | null) => void
  disabled?: boolean
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Campo de anexo opcional (PDF, PNG ou JPEG). Só guarda a escolha:
 * quem usa o campo decide quando enviar ou remover ao salvar.
 */
export function AttachmentField({
  label,
  hint,
  existingName,
  existingHref,
  removed,
  onRemovedChange,
  staged,
  onStagedChange,
  disabled,
}: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const hasExisting = Boolean(existingName) && !removed

  function choose(file: File | undefined) {
    if (!file) return
    const message = validateAttachment(file)
    setError(message)
    if (message) return
    onStagedChange(file)
    onRemovedChange(false)
  }

  return (
    <Field label={label} hint={hint} wide error={error ?? undefined}>
      <input
        ref={inputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        disabled={disabled}
        onChange={(event) => {
          choose(event.target.files?.[0])
          event.target.value = ""
        }}
      />

      {staged ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-subtle/40 p-3">
          <FileText className="size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{staged.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(staged.size)} · será enviado ao salvar</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => { onStagedChange(null); setError(null) }}
            aria-label="Cancelar anexo escolhido"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : hasExisting ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          <Paperclip className="size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{existingName}</p>
            <p className="text-xs text-muted-foreground">Anexo salvo</p>
          </div>
          {existingHref && (
            <a
              href={existingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-primary hover:bg-primary-subtle"
            >
              Abrir
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-semibold text-strong-foreground hover:bg-muted"
          >
            Trocar
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemovedChange(true)}
            aria-label="Remover anexo"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ) : removed ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border-strong bg-surface p-3">
          <p className="text-sm text-muted-foreground">O anexo atual será removido ao salvar.</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemovedChange(false)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-primary hover:bg-primary-subtle"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Desfazer
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-subtle/50 disabled:opacity-60"
        >
          <Paperclip className="size-4" aria-hidden />
          Anexar arquivo (PDF, PNG ou JPEG, até 5 MB)
        </button>
      )}
    </Field>
  )
}
