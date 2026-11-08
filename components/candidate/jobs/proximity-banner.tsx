"use client"

import { MapPin, X, AlertTriangle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export const RADII_OPTIONS = [5, 10, 25, 50] as const
export type RadiusKm = (typeof RADII_OPTIONS)[number]

interface ProximityBannerProps {
  isActive: boolean
  raioKm: number
  onChangeRaio: (newRaio: number) => void
  onClear: () => void
  error?: string | null
  onRetry?: () => void
  onDismissError?: () => void
}

export function ProximityBanner({
  isActive,
  raioKm,
  onChangeRaio,
  onClear,
  error,
  onRetry,
  onDismissError,
}: ProximityBannerProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-2xl border border-warning-border bg-warning-subtle p-4 text-warning-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-warning/20 text-warning">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">
              Localização não disponível
            </p>
            <p className="text-sm font-medium leading-snug">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Você pode continuar navegando e filtrando vagas normalmente por cidade ou estado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-warning-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <RefreshCw className="size-3.5" />
              Tentar novamente
            </button>
          )}
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-warning/15 hover:text-foreground"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!isActive) return null

  return (
    <section
      aria-label="Filtro por proximidade"
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
          <MapPin aria-hidden className="size-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">Vagas perto de você</h2>
          <p role="status" className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Até <span className="font-semibold text-primary-deep">{raioKm} km</span> da sua localização
          </p>
        </div>
      </div>

      <div className="flex w-full items-end gap-3 sm:w-auto">
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Distância máxima</p>
          <div
            role="group"
            aria-label="Distância máxima da busca"
            className="grid grid-cols-4 gap-1 rounded-xl border border-border-subtle bg-surface p-1"
          >
            {RADII_OPTIONS.map(radius => (
              <button
                key={radius}
                type="button"
                aria-pressed={raioKm === radius}
                onClick={() => onChangeRaio(radius)}
                className={cn(
                  "min-h-9 min-w-11 rounded-lg px-2 text-xs font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  raioKm === radius
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-primary-deep",
                )}
              >
                {radius} km
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remover filtro por proximidade"
          title="Remover filtro por proximidade"
          className="mb-0.5 grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  )
}
