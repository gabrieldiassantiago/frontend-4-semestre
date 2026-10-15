"use client"

import { ArrowLeft, ArrowRight, Loader2, Send, Briefcase } from "lucide-react"
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
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-md">
      {/* Barra de progresso estilo Airbnb no topo do footer */}
      <div className="h-1 w-full bg-border/60">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          disabled={currentStep === 1 || submitting}
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground underline-offset-4 transition-colors hover:bg-muted hover:underline disabled:pointer-events-none disabled:opacity-30"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>

        {/* Pílula de resumo em tempo real */}
        <div className="hidden min-w-0 items-center gap-2.5 rounded-full border border-border/80 bg-surface/90 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs md:flex">
          <Briefcase className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span className="max-w-[220px] truncate font-semibold text-foreground">
            {titulo.trim() || "Vaga sem título"}
          </span>
          <span className="text-border" aria-hidden>
            •
          </span>
          <span className="shrink-0 font-semibold text-foreground">
            {formatCurrency(salario)}
          </span>
          <span className="text-border" aria-hidden>
            •
          </span>
          <span className="shrink-0">{MODALIDADE_LABELS[modalidade]}</span>
        </div>

        {isLast ? (
          <button
            type="button"
            disabled={submitting}
            onClick={onPublish}
            className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
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
            className="inline-flex items-center gap-2.5 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Avançar
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </footer>
  )
}