"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Activity, BriefcaseBusiness, CheckCircle2, Plus, Users, Workflow } from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { BarChartSkeleton, ErrorState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import { useCompanyVagas } from "@/lib/queries/use-vagas"
import { AttentionPanel } from "./attention-panel"
import { JobsPerformance } from "./jobs-performance"
import { KpiCard } from "./kpi-card"
import { periodComparison } from "./metrics"
import { RecentApplicationsList } from "./recent-applications-list"

const ActivityChart = dynamic(() => import("./dashboard-charts").then(module => module.ActivityChart), {
  loading: () => <BarChartSkeleton bars={8} />,
})
const FunnelCard = dynamic(() => import("./dashboard-charts").then(module => module.FunnelCard), {
  loading: () => <BarChartSkeleton />,
})

const RECENT_LIMIT = 6

export function CompanyDashboardScreen() {
  const jobsQuery = useCompanyVagas()
  const applicationsQuery = useCandidaturasEmpresa()

  if (jobsQuery.loading || applicationsQuery.loading) return <RouteSkeleton variant="company-dashboard" />

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
  const recent = [...candidaturas]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, RECENT_LIMIT)

  return (
    <PageShell className="max-w-[1380px]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Painel de recrutamento</h1>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href={ROUTES.company.processes} className="btn-secondary rounded-xl px-4">
            <Workflow aria-hidden className="size-4" />
            Processos
          </Link>
          <Link href={ROUTES.company.newJob} className="btn-primary rounded-xl px-4">
            <Plus aria-hidden className="size-4" />
            Nova vaga
          </Link>
        </div>
      </header>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section aria-label="Indicadores do recrutamento" className="grid min-w-0 grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-2 sm:gap-3 sm:p-3">
          <KpiCard
            label="Vagas ativas"
            value={activeCount}
            icon={BriefcaseBusiness}
            featured
            href={ROUTES.company.jobs}
            note={`de ${vagas.length} ${vagas.length === 1 ? "vaga cadastrada" : "vagas cadastradas"}`}
          />
          <KpiCard
            label="Candidaturas"
            value={candidaturas.length}
            icon={Users}
            href={ROUTES.company.candidates}
            delta={weekly.delta}
            note={`${weekly.current} nos últimos 7 dias`}
          />
          <KpiCard
            label="Em andamento"
            value={inProgress}
            icon={Activity}
            href={ROUTES.company.processes}
            note={candidaturas.length ? `${Math.round((inProgress / candidaturas.length) * 100)}% do total em avaliação` : "Nenhuma em avaliação"}
          />
          <KpiCard
            label="Taxa de aprovação"
            value={approvalRate === null ? "—" : `${approvalRate}%`}
            icon={CheckCircle2}
            href={ROUTES.company.candidates}
            note={approvalRate === null ? "Sem processos encerrados" : `${approved} de ${finished} finalizadas`}
          />
        </section>
        <ActivityChart vagas={vagas} candidaturas={candidaturas} />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-4">
          <JobsPerformance vagas={vagas} candidaturas={candidaturas} />
          <RecentApplicationsList candidaturas={recent} />
        </div>
        <div className="grid min-w-0 gap-4">
          <AttentionPanel vagas={vagas} candidaturas={candidaturas} />
          <FunnelCard candidaturas={candidaturas} />
        </div>
      </div>
    </PageShell>
  )
}
