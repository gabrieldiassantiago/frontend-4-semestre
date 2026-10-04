"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Activity, BriefcaseBusiness, CheckCircle2, Plus, Users } from "lucide-react"
import { PageHeader, PageShell, Section, SectionLink } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { BarChartSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import { useCompanyVagas } from "@/lib/queries/use-vagas"
import { VagaRow } from "../vagas/vaga-row"
import { RecentApplicationsList } from "./recent-applications-list"

const DashboardCharts = dynamic(() => import("./dashboard-charts"), {
  loading: () => (
    <div className="mt-8 flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <BarChartSkeleton />
        <BarChartSkeleton />
      </div>
      <BarChartSkeleton bars={12} />
    </div>
  ),
})

const RECENT_LIMIT = 5

export function CompanyDashboardScreen() {
  const jobsQuery = useCompanyVagas()
  const applicationsQuery = useCandidaturasEmpresa()

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
  const pausedCount = vagas.length - activeCount
  const approved = candidaturas.filter((c) => c.status === "APROVADA").length
  const finished = candidaturas.filter((c) => c.status === "APROVADA" || c.status === "REPROVADA").length
  const inProgress = candidaturas.filter((c) => c.status === "EM_ANDAMENTO").length
  const approvalRate = finished > 0 ? Math.round((approved / finished) * 100) : null

  return (
    <PageShell className="max-w-[1380px]">
      <PageHeader
        eyebrow="Painel de gestão"
        title="Visão geral"
        description="Acompanhe as vagas publicadas e o andamento das candidaturas."
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Vagas ativas"
          value={activeCount}
          icon={BriefcaseBusiness}
          tone="primary"
          note={`${pausedCount > 0 ? `${pausedCount} pausada${pausedCount > 1 ? "s" : ""}` : "Todas publicadas"} · ${vagas.length} no total`}
        />
        <StatCard label="Candidaturas" value={candidaturas.length} icon={Users} tone="info" note={`${approved} aprovadas`} />
        <StatCard label="Em andamento" value={inProgress} icon={Activity} tone="warning" note="Em avaliação" />
        <StatCard
          label="Taxa de aprovação"
          value={approvalRate === null ? "—" : `${approvalRate}%`}
          icon={CheckCircle2}
          tone="success"
          note={approvalRate === null ? "Sem processos encerrados" : `${approved} de ${finished} finalizadas`}
        />
      </div>

      <DashboardCharts vagas={vagas} candidaturas={candidaturas} />

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Section
          title="Vagas publicadas"
          actions={vagas.length > 0 && <SectionLink href={ROUTES.company.jobs}>Ver todas</SectionLink>}
        >
          {vagas.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="Nenhuma vaga publicada"
              description="Crie sua primeira oportunidade para começar a receber candidaturas."
              action={
                <Link href={ROUTES.company.newJob} className="btn-primary">
                  <Plus aria-hidden className="size-4" />
                  Criar primeira vaga
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border bg-card">
              {vagas.slice(0, RECENT_LIMIT).map((vaga) => (
                <li key={vaga.id}>
                  <VagaRow vaga={vaga} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Candidaturas recentes"
          actions={candidaturas.length > 0 && <SectionLink href={ROUTES.company.candidates}>Ver todas</SectionLink>}
        >
          <RecentApplicationsList candidaturas={candidaturas.slice(0, RECENT_LIMIT)} />
        </Section>
      </div>
    </PageShell>
  )
}
