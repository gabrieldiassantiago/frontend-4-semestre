import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { ProgressRing } from "@/components/ui/progress-ring"
import { TickBar } from "@/components/ui/tick-bar"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"

/**
 * Atalho para completar o perfil, exibido na sidebar do candidato.
 * Mostra quanto falta e qual é o próximo item; some quando o perfil está completo.
 */
export function ProfileCompletionCard({
  completion,
  collapsed = false,
  onNavigate,
}: {
  completion: ProfileCompletion
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const { value, missing, missingRequired, complete } = completion
  if (complete) return null

  // Obrigatórios primeiro: são eles que liberam o "pronto para se candidatar".
  const next = missingRequired[0] ?? missing[0]
  const remaining = missing.length
  const summary = `Perfil ${value}% completo, ${remaining === 1 ? "falta 1 item" : `faltam ${remaining} itens`}`

  if (collapsed) {
    return (
      <Link
        href={ROUTES.candidate.completeProfile}
        onClick={onNavigate}
        title={summary}
        className="mx-auto mb-1 grid size-11 place-items-center rounded-full transition-colors hover:bg-primary-subtle"
      >
        <ProgressRing value={value} size={32} strokeWidth={3}>
          <span className="text-[9px] font-bold tabular-nums text-foreground">{value}</span>
        </ProgressRing>
        <span className="sr-only">{summary}</span>
      </Link>
    )
  }

  return (
    <Link
      href={ROUTES.candidate.completeProfile}
      onClick={onNavigate}
      aria-label={`${summary}. Continuar preenchimento`}
      className="group mb-2 block rounded-[20px] bg-primary-subtle p-3.5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold tracking-tight text-foreground">Complete seu perfil</p>
        <p className="text-lg font-semibold leading-none tracking-tight tabular-nums text-primary">{value}%</p>
      </div>

      <TickBar value={value} ticks={22} className="mt-3 h-4" trackClassName="bg-primary/15" />

      <p className="mt-3 text-xs leading-snug text-strong-foreground">
        {remaining === 1 ? "Falta 1 item" : `Faltam ${remaining} itens`}
        {next && (
          <>
            {" · próximo: "}
            <span className="font-semibold text-foreground">{next.label}</span>
          </>
        )}
      </p>

      <span className="mt-3 flex min-h-10 items-center justify-between gap-2 rounded-2xl bg-card py-1 pl-3.5 pr-1 text-xs font-semibold text-primary">
        Continuar
        <span className="grid size-8 place-items-center rounded-xl bg-primary-subtle transition-colors group-hover:bg-primary group-hover:text-white">
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
      </span>
    </Link>
  )
}
