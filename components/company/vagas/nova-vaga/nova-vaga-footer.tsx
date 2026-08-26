"use client"

import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { MODALIDADE_LABELS, type VagaModalidade } from "@/lib/types/vaga.types"
import { TOTAL_STEPS } from "./wizard"

export function NovaVagaFooter({
  currentStep,
  onBack,
  onAdvance,
  onPublish,
  submitting,
  titulo,
  salario,
  modalidade,
}: {
  currentStep: number
  onBack: () => void
  onAdvance: () => void
  onPublish: () => void
  submitting: boolean
  titulo: string
  salario: number
  modalidade: VagaModalidade
}) {
  const isLast = currentStep === TOTAL_STEPS

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          disabled={currentStep === 1 || submitting}
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-strong-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>

        <p className="hidden min-w-0 items-center gap-2 text-xs font-semibold text-muted-foreground md:flex">
          <span className="truncate">{titulo || "Vaga sem título"}</span>
          <span aria-hidden>•</span>
          <span className="shrink-0">{formatCurrency(salario)}</span>
          <span aria-hidden>•</span>
          <span className="shrink-0">{MODALIDADE_LABELS[modalidade]}</span>
        </p>

        {isLast ? (
          <button
            type="button"
            disabled={submitting}
            onClick={onPublish}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {submitting ? "Publicando..." : "Publicar vaga"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvance}
            className="inline-flex items-center gap-2 rounded-lg bg-strong px-5 py-2.5 text-sm font-bold text-strong-contrast transition-colors hover:bg-strong/90"
          >
            Continuar
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
