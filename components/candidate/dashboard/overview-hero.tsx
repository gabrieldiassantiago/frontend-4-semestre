import Link from "next/link"
import { ArrowRight, CalendarDays, Search } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { cn } from "@/lib/utils"
import { OverviewGreeting, OverviewToday } from "./overview-greeting"
import { OverviewUpdates } from "./overview-updates"

interface OverviewHeroProps {
  firstName?: string
  total: number
  inProgress: number
  approved: number
  closed: number
}

function summaryFor(inProgress: number) {
  if (inProgress === 0) return "Você não tem processos em andamento. Que tal encontrar sua próxima oportunidade?"
  if (inProgress === 1) return "Você tem 1 processo seletivo em andamento. Acompanhe cada etapa por aqui."
  return `Você tem ${inProgress} processos seletivos em andamento. Acompanhe cada etapa por aqui.`
}

export function OverviewHero({ firstName, total, inProgress, approved, closed }: OverviewHeroProps) {
  const segments = [
    { label: "Em andamento", value: inProgress, color: "bg-primary" },
    { label: "Aprovadas", value: approved, color: "bg-success" },
    { label: "Encerradas", value: closed, color: "bg-border-strong" },
  ]

  return (
    <section
      aria-labelledby="overview-title"
      className="relative isolate overflow-hidden rounded-panel border border-border bg-card shadow-card"
    >
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 -z-10" />

      <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:p-10">
        <div className="motion-enter flex min-w-0 flex-col">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-subtle px-3 py-1 text-xs font-medium text-primary-subtle-foreground">
            <CalendarDays aria-hidden className="size-3.5" />
            <span className="min-h-4">
              <OverviewToday />
            </span>
          </p>

          <h1
            id="overview-title"
            className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
          >
            <OverviewGreeting firstName={firstName} />
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {summaryFor(inProgress)}
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Link
              href={ROUTES.candidate.jobs}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Search aria-hidden className="size-4" />
              Buscar vagas
            </Link>
            <Link
              href={ROUTES.candidate.applications}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Minhas candidaturas
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-auto pt-9">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">{total}</span>{" "}
                <span className="text-muted-foreground">{total === 1 ? "candidatura" : "candidaturas"}</span>
              </p>
            </div>

            <div
              role="img"
              aria-label={segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}
              className="mt-3 flex h-2 w-full gap-1 overflow-hidden rounded-full bg-muted"
            >
              {total > 0 &&
                segments
                  .filter((s) => s.value > 0)
                  .map((s) => (
                    <span
                      key={s.label}
                      className={cn("h-full rounded-full", s.color)}
                      style={{ width: `${(s.value / total) * 100}%` }}
                    />
                  ))}
            </div>

            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {segments.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <span aria-hidden className={cn("size-2 rounded-full", s.color)} />
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="font-semibold tabular-nums text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="motion-enter min-w-0 [animation-delay:90ms]">
          <OverviewUpdates />
        </div>
      </div>
    </section>
  )
}
