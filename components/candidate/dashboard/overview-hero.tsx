import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { OverviewGreeting, OverviewToday } from "./overview-greeting"
import { OverviewStatGrid } from "./overview-stat-grid"
import { OverviewUpdates } from "./overview-updates"

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
    <section aria-labelledby="overview-title" className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">
            <OverviewToday />
          </p>
          <h1 id="overview-title" className="text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
            <OverviewGreeting firstName={firstName} />
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">
            {summaryFor(inProgress, total)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={ROUTES.candidate.applications}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Candidaturas
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
          <Link
            href={ROUTES.candidate.jobs}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-raised transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            <Search aria-hidden className="size-4" />
            Buscar vagas
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <OverviewStatGrid total={total} inProgress={inProgress} approved={approved} closed={closed} />
        <div className="lg:w-[360px] lg:shrink-0">
          <OverviewUpdates />
        </div>
      </div>
    </section>
  )
}
