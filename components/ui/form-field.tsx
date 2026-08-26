import { cn } from "@/lib/utils"

/** Label + controle + dica/erro. Usado por todos os formulários. */
export function Field({
  label,
  hint,
  error,
  wide,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  wide?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("block", wide && "sm:col-span-2", className)}>
      <span className="mb-2 block text-sm font-semibold text-strong-foreground">{label}</span>
      {children}
      {hint && !error && <span className="mt-2 block text-xs text-muted-foreground">{hint}</span>}
      {error && (
        <span className="mt-2 block text-xs font-medium text-danger-foreground" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

/** Cabeçalho de subseção dentro de um formulário. */
export function FieldGroupHeader({
  icon: Icon,
  title,
  description,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border-subtle pb-6">
      {Icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <div>
        <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

/** Input com ícone à esquerda. */
export function InputWithIcon({
  icon: Icon,
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<"input"> & {
  icon: React.ComponentType<{ className?: string }>
  /** Classes do container — use para controlar a largura dentro de um flex. */
  wrapperClassName?: string
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
        aria-hidden
      />
      <input className={cn("field-input pl-11", className)} {...props} />
    </div>
  )
}
