import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Hourglass,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { OverviewGreeting, OverviewToday } from "./overview-greeting"
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

export function OverviewHero({
  firstName,
  total,
  inProgress,
  approved,
  closed,
}: OverviewHeroProps) {
  const stats = [
    {
      label: "Candidaturas",
      value: total,
      icon: FileText,
      tone: "bg-primary-subtle text-primary",
    },
    {
      label: "Em andamento",
      value: inProgress,
      icon: Hourglass,
      tone: "bg-info-subtle text-info",
    },
    {
      label: "Aprovadas",
      value: approved,
      icon: CheckCircle2,
      tone: "bg-success-subtle text-success",
    },
    {
      label: "Encerradas",
      value: closed,
      icon: XCircle,
      tone: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <section aria-labelledby="overview-title" className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
      <div className="flex min-w-0 flex-1 flex-col gap-6 rounded-2xl border border-border-subtle bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles aria-hidden className="size-3.5 text-primary" />
              <OverviewToday />
            </p>
            <h1 id="overview-title" className="text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
              <OverviewGreeting firstName={firstName} />
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              {summaryFor(inProgress, total)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href={ROUTES.candidate.jobs} className="btn-primary inline-flex items-center gap-2">
              <Search aria-hidden className="size-4" />
              Buscar vagas
            </Link>
            <Link
              href={ROUTES.candidate.applications}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Candidaturas
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-background p-3.5">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon aria-hidden className="size-5" />
              </span>
              <div className="min-w-0">
                <dd className="text-2xl font-bold leading-none tabular-nums text-foreground">{value}</dd>
                <dt className="mt-1 truncate text-xs text-muted-foreground">{label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="lg:w-[340px] lg:shrink-0">
        <OverviewUpdates />
      </div>
    </section>
  )
}
