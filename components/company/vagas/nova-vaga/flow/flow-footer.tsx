"use client"

import { ArrowLeft, ArrowRight, Loader2, Rocket, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFlow } from "./flow-context"

/** Grade compartilhada entre conteúdo e rodapé para que os botões alinhem com a coluna central. */
export const FLOW_GRID =
  "mx-auto grid w-full max-w-7xl gap-x-10 px-4 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_280px]"

export function FlowFooter({
  isFirst,
  isLast,
  submitting,
  dirty = true,
  onBack,
  onNext,
  onPublish,
}: {
  isFirst: boolean
  isLast: boolean
  submitting: boolean
  /** Na edição, o botão de salvar só habilita quando há mudanças. */
  dirty?: boolean
  onBack: () => void
  onNext: () => void
  onPublish: () => void
}) {
  const { mode } = useFlow()
  const editing = mode === "edit"

  return (
    // Ações no fim do próprio formulário, sem faixa/caixa separada.
    <div className="mt-10 flex items-center justify-between gap-2 border-t border-border-subtle pt-6 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst || submitting}
            aria-label="Voltar para a etapa anterior"
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted max-sm:size-11 sm:rounded-xl sm:border-transparent sm:px-3.5",
              "disabled:pointer-events-none sm:disabled:opacity-0",
              isFirst && "max-sm:hidden",
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            {editing && !isLast && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Próxima seção"
                className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted max-sm:size-11 max-sm:rounded-full sm:px-4"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            )}

            {editing || isLast ? (
              <button
                type="button"
                onClick={onPublish}
                disabled={submitting || (editing && !dirty)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 sm:flex-none text-sm font-semibold text-primary-foreground shadow-raised transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : editing ? (
                  <Save className="size-4" aria-hidden />
                ) : (
                  <Rocket className="size-4" aria-hidden />
                )}
                {editing ? (submitting ? "Salvando..." : "Salvar alterações") : submitting ? "Publicando..." : "Publicar vaga"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="group inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-6 sm:flex-none text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Continuar
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            )}
          </div>
    </div>
  )
}
