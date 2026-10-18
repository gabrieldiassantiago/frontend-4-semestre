"use client"

import { Check, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "../../rich-text-editor"
import { FieldError, QuestionHeader } from "../primitives"
import { stripHtml } from "../steps"
import type { StepProps } from "../types"

const IDEAL_LENGTH = 400

export function StepDescricao({
  draft,
  update,
  errors,
  editorKey,
  onRegenerate,
}: StepProps & { editorKey: number; onRegenerate: () => void }) {
  const text = stripHtml(draft.descricao)
  const lower = text.toLowerCase()
  const checks = [
    { label: "Responsabilidades", ok: lower.includes("responsabilidade") },
    { label: "Requisitos", ok: lower.includes("requisito") },
    { label: `${IDEAL_LENGTH}+ caracteres`, ok: text.length >= IDEAL_LENGTH },
  ]
  const score = checks.filter((check) => check.ok).length
  const quality = score === checks.length ? "Ótima" : score >= 2 ? "Boa" : "Incompleta"

  return (
    <div>
      <QuestionHeader stepId="descricao" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1" aria-hidden>
            {checks.map((check, index) => (
              <span
                key={check.label}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors duration-300",
                  index < score ? "bg-success" : "bg-border",
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Qualidade: <strong className="font-semibold text-foreground">{quality}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Gerar rascunho novamente
        </button>
      </div>

      <RichTextEditor
        key={editorKey}
        value={draft.descricao}
        onChange={(descricao) => update({ descricao })}
        error={errors.descricao}
        placeholder="Fale sobre a missão da vaga, responsabilidades, requisitos e diferenciais..."
      />
      <FieldError message={errors.descricao} />

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Checklist da descrição">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300",
              check.ok ? "bg-success-subtle text-success-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <Check className={cn("size-3.5", !check.ok && "opacity-30")} aria-hidden />
            {check.label}
            <span className="sr-only">{check.ok ? "(ok)" : "(pendente)"}</span>
          </li>
        ))}
        <li className="ml-auto self-center text-xs tabular-nums text-subtle-foreground">
          {text.length} caracteres
        </li>
      </ul>
    </div>
  )
}
