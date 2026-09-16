import { cn } from "@/lib/utils"

/** Bloco de carregamento (skeleton). */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("skeleton-shimmer rounded-lg", className)} {...props} />
}

/** Skeleton no formato de card de lista, para evitar salto de layout. */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando conteúdo</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-card border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
              <div className="mt-1 flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Skeleton para os stat cards do dashboard (linha de 4 métricas). */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", count >= 4 && "lg:grid-cols-4")}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Carregando métricas</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border-subtle/60 bg-card/60 p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-9 w-16" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton para um gráfico de barras. */
export function BarChartSkeleton({ bars = 7 }: { bars?: number }) {
  return (
    <div
      className="rounded-2xl border border-border-subtle/60 bg-card/60 p-5"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Carregando gráfico</span>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-end gap-2 h-32">
        {Array.from({ length: bars }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${45 + Math.sin(i * 1.3) * 30}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {Array.from({ length: bars }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1 rounded" />
        ))}
      </div>
    </div>
  )
}

/** Skeleton para seção de lista de vagas do dashboard. */
export function VagasListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-card/60"
      aria-busy="true"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 p-4 sm:px-6 border-b border-border-subtle/50 last:border-0"
        >
          <div className="flex items-center gap-4 min-w-0">
            <Skeleton className="size-10 rounded-2xl shrink-0" />
            <div className="min-w-0 space-y-2 flex-1">
              <Skeleton className="h-3.5 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-2.5 w-24 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton para lista de candidatos/talentos. */
export function CandidatesListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="rounded-2xl border border-border-subtle/70 bg-card/60"
      aria-busy="true"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 p-4 border-b border-border-subtle/50 last:border-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="size-9 rounded-full shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton para coluna do kanban. */
export function KanbanColumnSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-2xl border border-border-subtle/50 bg-card lg:w-auto lg:flex-1">
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-6 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 p-2.5">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-subtle/50 p-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Skeleton para tela kanban completa (7 colunas). */
export function KanbanSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4" aria-busy="true">
      <span className="sr-only">Carregando funil</span>
      {Array.from({ length: 7 }).map((_, i) => (
        <KanbanColumnSkeleton key={i} cards={i < 3 ? 3 : i < 5 ? 2 : 1} />
      ))}
    </div>
  )
}

/** Skeleton para a tela de seleção de vagas (processos). */
export function VagaSelectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border-subtle/60 bg-card/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Skeleton className="size-11 rounded-2xl shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <Skeleton className="h-4 w-52" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="size-4 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Estado vazio consistente: ícone, título, descrição e ação opcional. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="grid size-12 place-items-center rounded-2xl bg-primary-subtle text-primary-subtle-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <h3 className="mt-4 text-base font-bold tracking-tight text-foreground text-pretty">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

const ALERT_TONES = {
  danger: "border-danger-border bg-danger-subtle text-danger-foreground",
  success: "border-success-border bg-success-subtle text-success-foreground",
  info: "border-border bg-muted text-foreground",
} as const

/** Aviso em linha para feedback de formulários. */
export function Alert({
  tone = "info",
  children,
}: {
  tone?: keyof typeof ALERT_TONES
  children: React.ReactNode
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium leading-relaxed",
        ALERT_TONES[tone],
      )}
    >
      {children}
    </div>
  )
}

/** Mensagem de erro em linha. */
export function ErrorState({
  title = "Não foi possível carregar",
  description,
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-card border border-danger-border bg-danger-subtle px-6 py-10 text-center"
    >
      <h3 className="text-base font-bold text-danger-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-danger-foreground/80">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
