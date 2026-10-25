"use client"

import { Lock, Pencil } from "lucide-react"
import { useFlow } from "../flow-context"
import { formatCurrency } from "@/lib/format"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
} from "@/lib/types/vaga.types"
import { QuestionHeader } from "../primitives"
import { FLOW_STEPS, stripHtml } from "../steps"
import type { StepId, VagaDraft } from "../types"
import { getEtapaLabel } from "./step-processo"

function ReviewSection({
  stepId,
  onEdit,
  children,
}: {
  stepId: StepId
  onEdit: (stepId: StepId) => void
  children: React.ReactNode
}) {
  const { steps } = useFlow()
  const editable = steps.some((item) => item.id === stepId)
  const step = FLOW_STEPS.find((item) => item.id === stepId)!
  const Icon = step.icon

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {step.label}
        </h3>
        {editable ? (
          <button
            type="button"
            onClick={() => onEdit(stepId)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle"
          >
            <Pencil className="size-3" aria-hidden />
            Editar
            <span className="sr-only">{step.label}</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-subtle-foreground">
            <Lock className="size-3" aria-hidden />
            Fixo após publicar
          </span>
        )}
      </div>
      <div className="mt-2.5 text-sm text-foreground">{children}</div>
    </section>
  )
}

export function StepRevisao({
  draft,
  onEdit,
  preview,
}: {
  draft: VagaDraft
  onEdit: (stepId: StepId) => void
  preview?: React.ReactNode
}) {
  const descricao = stripHtml(draft.descricao)

  return (
    <div>
      <QuestionHeader stepId="revisao" />

      {preview}

      <div className="grid gap-3 sm:grid-cols-2">
        <ReviewSection stepId="titulo" onEdit={onEdit}>
          <p className="text-base font-semibold text-balance">{draft.titulo}</p>
        </ReviewSection>

        <ReviewSection stepId="perfil" onEdit={onEdit}>
          <p className="font-medium">{CATEGORIA_LABELS[draft.categoria]}</p>
          <p className="text-muted-foreground">
            {MODALIDADE_LABELS[draft.modalidade]} · {draft.quantidadeVagas || 1} {draft.quantidadeVagas === 1 ? "vaga disponível" : "vagas disponíveis"}
          </p>
        </ReviewSection>

        <ReviewSection stepId="local" onEdit={onEdit}>
          <p className="font-medium">
            {draft.cidade}
            {draft.estado ? `, ${draft.estado}` : ""}
          </p>
        </ReviewSection>

        <ReviewSection stepId="salario" onEdit={onEdit}>
          <p className="text-base font-semibold tabular-nums">
            {formatCurrency(draft.salario)}
            <span className="ml-1 text-xs font-medium text-muted-foreground">/ mês</span>
          </p>
        </ReviewSection>

        <div className="sm:col-span-2">
          <ReviewSection stepId="beneficios" onEdit={onEdit}>
            {draft.beneficios.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {draft.beneficios.map((benefit) => (
                  <li key={benefit} className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-strong-foreground">
                    {benefit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum benefício informado.</p>
            )}
          </ReviewSection>
        </div>

        <div className="sm:col-span-2">
          <ReviewSection stepId="descricao" onEdit={onEdit}>
            <p className="line-clamp-3 leading-relaxed text-muted-foreground">{descricao}</p>
          </ReviewSection>
        </div>

        <div className="sm:col-span-2">
          <ReviewSection stepId="processo" onEdit={onEdit}>
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
              {["Inscrição", ...draft.etapas.map(getEtapaLabel)].map((label, index) => (
                <li key={label} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden className="text-subtle-foreground">→</span>}
                  <span className="rounded-md bg-primary-subtle px-2 py-1 text-primary-subtle-foreground">
                    {label}
                  </span>
                </li>
              ))}
            </ol>
            {draft.metaTags.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Palavras-chave: {draft.metaTags.join(", ")}
              </p>
            )}
          </ReviewSection>
        </div>
      </div>
    </div>
  )
}
