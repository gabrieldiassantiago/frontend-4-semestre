"use client"

import { useState } from "react"
import { Award, CalendarDays, ExternalLink, Link2, Plus, Trash2, X } from "lucide-react"
import { Field, InputWithIcon } from "@/components/ui/form-field"

export interface CertificateDraft {
  id: string
  name: string
  issuer: string
  issueMonth: string
  credentialUrl: string
}

const SUGGESTIONS = ["Excel avançado", "Inglês (TOEFL/Cambridge)", "Scrum Fundamentals", "Google Analytics", "Primeiros socorros"]

const EMPTY = { name: "", issuer: "", issueMonth: "", credentialUrl: "" }

function formatMonth(value: string) {
  if (!value) return ""
  const [year, month] = value.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "")
}

export function CertificatesStep({
  items,
  onChange,
}: {
  items: CertificateDraft[]
  onChange: (items: CertificateDraft[]) => void
}) {
  const [adding, setAdding] = useState(items.length === 0)
  const [draft, setDraft] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)

  function openForm(name = "") {
    setDraft({ ...EMPTY, name })
    setError(null)
    setAdding(true)
  }

  function save() {
    if (!draft.name.trim() || !draft.issuer.trim()) {
      setError("Informe o nome do certificado e quem o emitiu.")
      return
    }
    onChange([...items, { id: crypto.randomUUID(), ...draft, name: draft.name.trim(), issuer: draft.issuer.trim() }])
    setDraft(EMPTY)
    setError(null)
    setAdding(false)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      {items.length > 0 && (
        <ul className="flex flex-col gap-3" aria-label="Certificados adicionados">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
                <Award className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.issuer}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle-foreground">
                  {item.issueMonth && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {formatMonth(item.issueMonth)}
                    </span>
                  )}
                  {item.credentialUrl && (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <ExternalLink className="size-3.5" aria-hidden />
                      Credencial anexada
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label={`Remover ${item.name}`}
                onClick={() => onChange(items.filter((c) => c.id !== item.id))}
                className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-danger-foreground"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Novo certificado</h3>
            {items.length > 0 && (
              <button
                type="button"
                aria-label="Cancelar"
                onClick={() => setAdding(false)}
                className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome do certificado *" wide>
              <input
                className="field-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex.: Excel avançado"
                maxLength={120}
              />
            </Field>
            <Field label="Instituição emissora *">
              <input
                className="field-input"
                value={draft.issuer}
                onChange={(e) => setDraft({ ...draft, issuer: e.target.value })}
                placeholder="Ex.: Coursera, SENAC, Alura"
              />
            </Field>
            <Field label="Data de emissão">
              <input
                type="month"
                className="field-input"
                value={draft.issueMonth}
                onChange={(e) => setDraft({ ...draft, issueMonth: e.target.value })}
              />
            </Field>
            <Field label="Link da credencial" wide hint="Opcional. Ajuda a empresa a validar o certificado.">
              <InputWithIcon
                icon={Link2}
                type="url"
                value={draft.credentialUrl}
                onChange={(e) => setDraft({ ...draft, credentialUrl: e.target.value })}
                placeholder="https://"
              />
            </Field>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-xs font-medium text-danger-foreground">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            {items.length > 0 && (
              <button type="button" className="btn-ghost min-h-11 px-4" onClick={() => setAdding(false)}>
                Cancelar
              </button>
            )}
            <button type="button" className="btn-primary min-h-11 gap-2 px-5" onClick={save}>
              <Plus className="size-4" aria-hidden />
              Adicionar certificado
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openForm()}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong text-sm font-semibold text-primary transition-colors hover:bg-primary-subtle/50"
        >
          <Plus className="size-4" aria-hidden />
          Adicionar outro certificado
        </button>
      )}

      {items.length === 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Sugestões para começar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => openForm(suggestion)}
                className="min-h-9 rounded-full border border-border bg-card px-3 text-xs font-semibold text-strong-foreground transition-colors hover:border-primary hover:text-primary"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
