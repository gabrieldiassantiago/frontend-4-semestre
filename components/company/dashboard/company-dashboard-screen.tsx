"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Activity, BriefcaseBusiness, CheckCircle2, Plus, Users, Workflow } from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { BarChartSkeleton, ErrorState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import { useCompanyIdentity } from "@/lib/queries/use-company-profile"
import { useCompanyVagas } from "@/lib/queries/use-vagas"
import { AttentionPanel } from "./attention-panel"
import { JobsPerformance } from "./jobs-performance"
import { KpiCard } from "./kpi-card"
import { periodComparison, weeklyBuckets } from "./metrics"
import { RecentApplicationsList } from "./recent-applications-list"

const DashboardCharts = dynamic(() => import("./dashboard-charts"), {
  loading: () => (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BarChartSkeleton bars={12} />
      </div>
      <BarChartSkeleton />
    </div>
  ),
})

const RECENT_LIMIT = 6

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

export function CompanyDashboardScreen() {
  const jobsQuery = useCompanyVagas()
  const applicationsQuery = useCandidaturasEmpresa()
  const { companyName } = useCompanyIdentity()

  if (jobsQuery.loading || applicationsQuery.loading) return <RouteSkeleton variant="dashboard" />

  const error = jobsQuery.error || applicationsQuery.error
  if (error) {
    return (
      <PageShell>
        <ErrorState
          description={error}
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void jobsQuery.refetch()
                void applicationsQuery.refetch()
              }}
            >
              Tentar novamente
            </button>
          }
        />
      </PageShell>
    )
  }

  const { vagas } = jobsQuery
  const { candidaturas } = applicationsQuery
  const activeCount = vagas.filter((v) => v.ativa).length
  const approved = candidaturas.filter((c) => c.status === "APROVADA").length
  const finished = candidaturas.filter((c) => c.status === "APROVADA" || c.status === "REPROVADA").length
  const inProgress = candidaturas.filter((c) => c.status === "EM_ANDAMENTO").length
  const approvalRate = finished > 0 ? Math.round((approved / finished) * 100) : null
  const weekly = periodComparison(candidaturas)
  const spark = weeklyBuckets(vagas, candidaturas, 8).map((week) => week.candidaturas)
  const recent = [...candidaturas]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, RECENT_LIMIT)

  return (
    <PageShell className="max-w-[1380px]">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p suppressHydrationWarning className="text-sm text-muted-foreground">
            {greeting()}, {companyName ?? "equipe"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground text-balance sm:text-4xl">
            Boas conexões começam aqui.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Seu recrutamento em um só lugar. Acompanhe as oportunidades e dê o próximo passo com seus candidatos.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href={ROUTES.company.processes} className="btn-secondary rounded-full px-5">
            <Workflow aria-hidden className="size-4" />
            Processos
          </Link>
          <Link href={ROUTES.company.newJob} className="btn-primary rounded-full px-5">
            <Plus aria-hidden className="size-4" />
            Nova vaga
          </Link>
        </div>
      </header>

      <section aria-label="Indicadores do recrutamento" className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <KpiCard
          label="Vagas ativas"
          value={activeCount}
          icon={BriefcaseBusiness}
          tone="primary"
          href={ROUTES.company.jobs}
          note={`de ${vagas.length} ${vagas.length === 1 ? "vaga publicada" : "vagas publicadas"}`}
          progress={vagas.length ? (activeCount / vagas.length) * 100 : 0}
        />
        <KpiCard
          label="Candidaturas"
          value={candidaturas.length}
          icon={Users}
          tone="info"
          href={ROUTES.company.candidates}
          delta={weekly.delta}
          note={`${weekly.current} nos últimos 7 dias`}
          spark={spark}
        />
        <KpiCard
          label="Em andamento"
          value={inProgress}
          icon={Activity}
          tone="warning"
          href={ROUTES.company.processes}
          note={candidaturas.length ? `${Math.round((inProgress / candidaturas.length) * 100)}% do total em avaliação` : "Nenhuma em avaliação"}
          progress={candidaturas.length ? (inProgress / candidaturas.length) * 100 : 0}
        />
        <KpiCard
          label="Taxa de aprovação"
          value={approvalRate === null ? "—" : `${approvalRate}%`}
          icon={CheckCircle2}
          tone="success"
          href={ROUTES.company.candidates}
          note={approvalRate === null ? "Sem processos encerrados" : `${approved} de ${finished} finalizadas`}
          progress={approvalRate}
        />
      </section>

      <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-xl font-semibold tracking-tight">O panorama da sua equipe</h2><p className="mt-1 text-sm text-muted-foreground">Uma visão de como suas oportunidades estão evoluindo.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"><span aria-hidden className="size-1.5 rounded-full bg-success" />Dados dos seus processos</span>
      </div>
      <div>
        <DashboardCharts vagas={vagas} candidaturas={candidaturas} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JobsPerformance vagas={vagas} candidaturas={candidaturas} />
        </div>
        <div className="flex flex-col gap-6">
          <AttentionPanel vagas={vagas} candidaturas={candidaturas} />
          <RecentApplicationsList candidaturas={recent} />
        </div>
      </div>
    </PageShell>
  )
}
