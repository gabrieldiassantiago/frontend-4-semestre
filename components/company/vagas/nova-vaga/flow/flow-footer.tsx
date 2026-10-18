"use client"

import { ArrowLeft, ArrowRight, CornerDownLeft, Loader2, Rocket, Save } from "lucide-react"
import { useFlow } from "./flow-context"

/** Grade compartilhada entre conteúdo e rodapé para que os botões alinhem com a coluna central. */
export const FLOW_GRID =
  "mx-auto grid w-full max-w-7xl gap-x-10 px-4 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[200px_minmax(0,1fr)_280px]"

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
    <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 mt-10 border-t border-border bg-background/90 backdrop-blur-md lg:bottom-0">
      <div className={FLOW_GRID}>
        <span aria-hidden className="hidden lg:block" />
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 py-3.5">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst || submitting}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar
          </button>

          {!isLast && !editing && (
            <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
              Pressione
              <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold text-strong-foreground">
                Enter <CornerDownLeft className="size-3" aria-hidden />
              </kbd>
              para continuar
            </p>
          )}

          <div className="flex items-center gap-2">
            {editing && !isLast && (
              <button
                type="button"
                onClick={onNext}
                className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted"
              >
                Próxima
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            )}

            {editing || isLast ? (
              <button
                type="button"
                onClick={onPublish}
                disabled={submitting || (editing && !dirty)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-raised transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
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
                className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Continuar
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
