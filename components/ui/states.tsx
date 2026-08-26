import { cn } from "@/lib/utils"

/** Bloco de carregamento (skeleton). */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />
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
