import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { OverviewGreeting, OverviewToday } from "./overview-greeting"
import { OverviewStatGrid } from "./overview-stat-grid"

interface OverviewHeroProps {
  firstName?: string
  total: number
  inProgress: number
  approved: number
  closed: number
}

function summaryFor(inProgress: number, total: number) {
  if (total === 0) {
    return "Você ainda não se candidatou a nenhuma vaga. Explore as oportunidades abertas."
  }
  if (inProgress === 0) {
    return "Você não tem processos seletivos em andamento no momento."
  }
  if (inProgress === 1) {
    return "Você tem 1 processo seletivo em andamento. Acompanhe cada etapa por aqui."
  }
  return `Você tem ${inProgress} processos seletivos em andamento. Acompanhe cada etapa por aqui.`
}

export function OverviewHero({ firstName, total, inProgress, approved, closed }: OverviewHeroProps) {
  return (
    <section aria-labelledby="overview-title" className="flex flex-col gap-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <OverviewToday />
          </p>
          <h1
            id="overview-title"
            className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl"
          >
            <OverviewGreeting firstName={firstName} />
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground text-pretty">
            {summaryFor(inProgress, total)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Link
            href={ROUTES.candidate.applications}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/80 bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Minhas candidaturas
            <ArrowUpRight aria-hidden className="size-4 text-muted-foreground" />
          </Link>
          <Link
            href={ROUTES.candidate.jobs}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-2xs transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            <Search aria-hidden className="size-4" />
            Buscar vagas
          </Link>
        </div>
      </div>

      <OverviewStatGrid
        total={total}
        inProgress={inProgress}
        approved={approved}
        closed={closed}
      />
    </section>
  )
}