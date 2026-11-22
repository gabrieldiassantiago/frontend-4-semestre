import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function KpiCard({ label, value, icon: Icon, featured, href, note, delta }: {
  label: string
  value: number | string
  icon: LucideIcon
  featured?: boolean
  href: string
  note: string
  delta?: number | null
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full min-w-0 flex-col justify-between gap-5 rounded-xl p-4 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5",
        featured ? "bg-primary text-white hover:bg-primary-hover" : "bg-surface text-ink hover:bg-primary-subtle",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("grid size-10 place-items-center rounded-xl", featured ? "bg-white/15 text-white" : "bg-card text-primary ring-1 ring-border-subtle")}>
          <Icon aria-hidden className="size-5" strokeWidth={1.8} />
        </span>
        <ArrowUpRight
          aria-hidden
          className={cn(
            "size-4 transition-all duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5",
            featured ? "text-white/70 group-hover:text-white" : "text-subtle-foreground group-hover:text-primary",
          )}
        />
      </div>

      <div>
        <p className="text-4xl font-semibold leading-none tracking-tight tabular-nums">{value}</p>
        <p className={cn("mt-2 text-sm font-medium", featured ? "text-white" : "text-strong-foreground")}>{label}</p>
        <div className={cn("mt-1.5 flex flex-wrap items-center gap-1.5 text-xs leading-5", featured ? "text-white/80" : "text-muted-foreground")}>
          {delta !== undefined && <DeltaPill delta={delta} />}
          <span>{note}</span>
        </div>
      </div>
    </Link>
  )
}

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="rounded-full bg-mint-subtle px-1.5 py-0.5 font-semibold text-mint-strong">Novo</span>
  }
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
  return (
    <span
      title="Variação em relação aos 7 dias anteriores"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
        delta > 0 && "bg-mint-subtle text-mint-strong",
        delta < 0 && "bg-danger-subtle text-danger-foreground",
        delta === 0 && "bg-muted text-muted-foreground",
      )}
    >
      <Icon aria-hidden className="size-3" />
      {Math.abs(delta)}%
      <span className="sr-only">{delta > 0 ? "de aumento" : delta < 0 ? "de queda" : "sem variação"}</span>
    </span>
  )
}
