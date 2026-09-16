"use client"

import { Crosshair, MapPin, X, AlertTriangle, RefreshCw, ChevronRight } from "lucide-react"
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
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary-subtle/80 via-primary-subtle/40 to-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <Crosshair className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-success" />
          </span>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <span>Busca por Proximidade Ativa</span>
          </p>
          <p className="text-sm font-semibold text-foreground">
            Exibindo vagas em um raio de{" "}
            <span className="font-bold text-primary">{raioKm} km</span> da sua localização
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-surface/80 p-1 border border-border">
          <span className="px-2 text-[11px] font-semibold text-muted-foreground">Raio:</span>
          {RADII_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChangeRaio(r)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                raioKm === r
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {r} km
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClear}
          title="Desativar busca por proximidade"
          className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
          <span>Limpar</span>
        </button>
      </div>
    </div>
  )
}
