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
    <section
      aria-labelledby="profile-completion-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-2xs sm:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="6"
              className="stroke-border/60"
            />
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
          <span className="absolute inset-0 grid place-items-center text-sm font-extrabold tabular-nums text-foreground">
            {value}%
          </span>
        </div>

        <div className="min-w-0">
          <h2
            id="profile-completion-title"
            className="text-base font-extrabold tracking-tight text-foreground"
          >
            {complete ? "Perfil completo" : "Fortaleça seu perfil"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {complete
              ? "Seu currículo está 100% pronto para se destacar nas buscas."
              : "Perfis completos têm até 3x mais chances de avançar para entrevistas."}
          </p>
        </div>
      </div>

      {complete ? (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-subtle/70 px-3.5 py-2.5 text-xs font-bold text-success-foreground">
          <Sparkles aria-hidden className="size-4 shrink-0 text-success" />
          Tudo pronto para impressionar recrutadores
        </p>
      ) : (
        <>
          <ul className="mt-5 flex flex-col gap-2.5 border-t border-border/60 pt-4">
            {missing.slice(0, VISIBLE_MISSING).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2.5 text-xs font-semibold text-foreground"
              >
                <Circle aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.label}</span>
                {item.required && (
                  <span className="ml-auto shrink-0 rounded-full bg-warning-subtle px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning-foreground">
                    Obrigatório
                  </span>
                )}
              </li>
            ))}
            {missing.length > VISIBLE_MISSING && (
              <li className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                <CheckCircle2 aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                {`+${missing.length - VISIBLE_MISSING} itens complementares`}
              </li>
            )}
          </ul>

          <Link
            href={ROUTES.candidate.completeProfile}
            className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-2xs transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            Completar agora
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </>
      )}
    </section>
  )
}