import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Hourglass,
  Search,
  XCircle,
} from "lucide-react"
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
      label: "Total de candidaturas",
      value: total,
      icon: FileText,
      iconStyle: "bg-primary/10 text-primary",
    },
    {
      label: "Em andamento",
      value: inProgress,
      icon: Hourglass,
      iconStyle: "bg-info-subtle text-info",
    },
    {
      label: "Aprovadas",
      value: approved,
      icon: CheckCircle2,
      iconStyle: "bg-success-subtle text-success",
    },
    {
      label: "Encerradas",
      value: closed,
      icon: XCircle,
      iconStyle: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <section aria-labelledby="overview-title" className="space-y-8">
      {/* 1. Cabeçalho Aberto: Saudação à esquerda, Ações à direita */}
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <OverviewToday />
          </p>

          <h1
            id="overview-title"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            <OverviewGreeting firstName={firstName} />
          </h1>

          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {summaryFor(inProgress, total)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={ROUTES.candidate.jobs}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Search aria-hidden className="size-4" />
            Buscar vagas
          </Link>

          <Link
            href={ROUTES.candidate.applications}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Minhas candidaturas
            <ArrowUpRight aria-hidden className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* 2. Grid Distribuído de Cards de Métricas (4 colunas bem espaçadas) */}
      <dl className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, iconStyle }) => (
          <div
            key={label}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs font-medium text-muted-foreground sm:text-sm">
                {label}
              </dt>
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl",
                  iconStyle,
                )}
              >
                <Icon aria-hidden className="size-4" />
              </span>
            </div>

            <dd className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* 3. Novidades Desacopladas em Grid Próprio */}
      <OverviewUpdates />
    </section>
  )
}