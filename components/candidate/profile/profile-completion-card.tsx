import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ROUTES } from "@/lib/config/routes"
import { cn } from "@/lib/utils"

/** Atalho para completar o perfil, exibido na sidebar do candidato. */
export function ProfileCompletionCard({
  value,
  collapsed = false,
  onNavigate,
}: {
  value: number
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const complete = value >= 100
  const href = complete ? ROUTES.candidate.profile : ROUTES.candidate.completeProfile

  if (collapsed) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        title={`Perfil ${value}% completo`}
        className="mx-auto mb-1 grid size-10 place-items-center rounded-lg transition-colors hover:bg-muted"
      >
        <ProgressRing value={value} size={30} strokeWidth={3}>
          <span className="text-[9px] font-bold tabular-nums text-foreground">{value}</span>
        </ProgressRing>
        <span className="sr-only">Perfil {value}% completo</span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group mb-2 flex items-center gap-3 rounded-xl border p-3 transition-colors",
        complete ? "border-success-border bg-success-subtle" : "border-border bg-surface hover:border-primary/40",
      )}
    >
      {complete ? (
        <CheckCircle2 aria-hidden className="size-9 shrink-0 text-success" strokeWidth={1.5} />
      ) : (
        <ProgressRing value={value} size={36} strokeWidth={3.5}>
          <span className="text-[10px] font-bold tabular-nums text-foreground">{value}%</span>
        </ProgressRing>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{complete ? "Perfil completo" : "Complete seu perfil"}</p>
        <p className="text-xs leading-snug text-muted-foreground">
          {complete ? "Você está pronto para se candidatar." : "Receba vagas mais alinhadas a você."}
        </p>
      </div>
      <ArrowRight aria-hidden className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
