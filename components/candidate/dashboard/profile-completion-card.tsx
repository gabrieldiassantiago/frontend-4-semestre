import Link from "next/link"
import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import type { ProfileCompletion } from "@/lib/candidate-completion"

const VISIBLE_MISSING = 3
const RING_RADIUS = 28
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function ProfileCompletionCard({ completion }: { completion: ProfileCompletion }) {
  const { value, missing, complete } = completion
  const offset = RING_CIRCUMFERENCE * (1 - value / 100)

  return (
    <section aria-labelledby="profile-completion-title" className="rounded-card border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-border-subtle" />
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={offset}
              className={complete ? "stroke-success" : "stroke-primary"}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums text-foreground">
            {value}%
          </span>
        </div>
        <div className="min-w-0">
          <h2 id="profile-completion-title" className="text-base font-semibold tracking-tight text-foreground">
            {complete ? "Perfil completo" : "Complete seu perfil"}
          </h2>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {complete
              ? "Seu perfil está pronto para as empresas."
              : "Perfis completos chamam mais atenção dos recrutadores."}
          </p>
        </div>
      </div>

      {complete ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-success-subtle px-3 py-2.5 text-sm font-medium text-success-foreground">
          <Sparkles aria-hidden className="size-4 shrink-0" />
          Tudo certo por aqui
        </p>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-2 border-t border-border-subtle pt-4">
            {missing.slice(0, VISIBLE_MISSING).map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 text-sm text-strong-foreground">
                <Circle aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
                <span className="truncate">{item.label}</span>
                {item.required && (
                  <span className="ml-auto shrink-0 text-[11px] font-semibold uppercase tracking-wide text-warning-foreground">
                    Obrigatório
                  </span>
                )}
              </li>
            ))}
            {missing.length > VISIBLE_MISSING && (
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
                {`+${missing.length - VISIBLE_MISSING} itens pendentes`}
              </li>
            )}
          </ul>
          <Link href={ROUTES.candidate.completeProfile} className="btn-primary mt-4 w-full">
            Completar perfil
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </>
      )}
    </section>
  )
}
