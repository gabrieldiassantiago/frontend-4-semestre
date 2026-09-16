"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react"

import { useCompanyVagas } from "@/lib/hooks/useCompanyVagas"
import { useCandidaturasEmpresa } from "@/lib/hooks/useCandidaturas"
import { PageShell } from "@/components/ui/page"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import {
  StatCardsSkeleton,
  VagasListSkeleton,
  CandidatesListSkeleton,
  BarChartSkeleton,
} from "@/components/ui/states"
import { VagaRow } from "../vagas/vaga-row"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { ErrorState } from "@/components/ui/states"

const DashboardCharts = dynamic(() => import("./dashboard-charts"), {
  loading: () => <div className="mt-8 space-y-5"><div className="grid gap-5 lg:grid-cols-2"><BarChartSkeleton /><BarChartSkeleton /></div><BarChartSkeleton bars={12} /></div>,
})

export function CompanyDashboardScreen() {
  const { vagas, loading: vagasLoading, error: vagasError, refetch: refetchVagas } = useCompanyVagas()
  const { candidaturas, loading: candidaturasLoading, error: candidaturasError, refetch: refetchCandidaturas } = useCandidaturasEmpresa()

  const loading = vagasLoading || candidaturasLoading

  const activeCount = vagas.filter((v) => v.ativa).length
  const pausedCount = vagas.length - activeCount
  const recentVagas = vagas.slice(0, 4)

  // Taxa de aprovação (candidaturas aprovadas / total finalizadas)
  const aprovadas = candidaturas.filter((c) => c.status === "APROVADA").length
  const finalizadas = candidaturas.filter(
    (c) => c.status === "APROVADA" || c.status === "REPROVADA",
  ).length
  const taxaAprovacao = finalizadas > 0 ? Math.round((aprovadas / finalizadas) * 100) : 0

  if (loading) return <RouteSkeleton variant="dashboard" />
  if (vagasError || candidaturasError) return <PageShell><ErrorState description={vagasError || candidaturasError || undefined} action={<button type="button" className="btn-primary" onClick={() => { refetchVagas(); void refetchCandidaturas() }}>Tentar novamente</button>} /></PageShell>

  return (
    <PageShell className="max-w-6xl py-8">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-border-subtle/50 pb-8 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Painel de Gestão
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Visão Geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe a tração das suas posições e os candidatos em destaque.
          </p>
        </div>

        <Link
          href="/empresa/vagas/nova"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-95 active:scale-95"
        >
          <Plus className="size-4" aria-hidden />
          Criar vaga
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="mt-8">
        {loading ? (
          <StatCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Vagas ativas */}
            <div className="rounded-2xl border border-border-subtle/60 bg-card/60 p-5 backdrop-blur-sm transition-all hover:bg-card">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Vagas ativas</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BriefcaseBusiness className="size-4" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {activeCount}
              </p>
              <span className="mt-1 block text-xs text-muted-foreground">
                {pausedCount > 0 ? `${pausedCount} pausada${pausedCount > 1 ? "s" : ""}` : "Todas publicadas"} · {vagas.length} total
              </span>
            </div>

            {/* Candidaturas */}
            <div className="rounded-2xl border border-border-subtle/60 bg-card/60 p-5 backdrop-blur-sm transition-all hover:bg-card">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Candidaturas</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-info-subtle text-info">
                  <Users className="size-4" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {candidaturas.length}
              </p>
              <span className="mt-1 flex items-center gap-1 text-xs font-medium text-success-foreground">
                <TrendingUp className="size-3" />
                {aprovadas} aprovadas no total
              </span>
            </div>

            {/* Taxa de aprovação */}
            <div className="rounded-2xl border border-border-subtle/60 bg-card/60 p-5 backdrop-blur-sm transition-all hover:bg-card">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Taxa de aprovação</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-success-subtle text-success-foreground">
                  <Activity className="size-4" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {finalizadas > 0 ? `${taxaAprovacao}%` : "—"}
              </p>
              <span className="mt-1 block text-xs text-muted-foreground">
                {finalizadas > 0
                  ? `${aprovadas} de ${finalizadas} finalizadas`
                  : "Sem processos encerrados"}
              </span>
            </div>

            {/* Dica de recrutamento */}
            <div className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-primary-subtle/40 p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Dica
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
                    Inclua a faixa salarial e as responsabilidades da vaga para ajudar candidatos a avaliar a oportunidade.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/empresa/vagas/nova"
                  className="text-xs font-semibold text-primary transition-colors hover:underline"
                >
                  Publicar com detalhes →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <DashboardCharts vagas={vagas} candidaturas={candidaturas} />

      {/* ── Conteúdo Principal (Vagas + Candidatos) ── */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Vagas recentes */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Vagas publicadas
            </h2>
            <Link
              href="/empresa/vagas"

              className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver catálogo completo
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <VagasListSkeleton rows={4} />
          ) : recentVagas.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-card/60 py-12">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <BriefcaseBusiness className="size-5" />
                </span>
                <p className="text-sm font-semibold text-foreground">Nenhuma vaga ativa</p>
                <p className="text-xs text-muted-foreground">
                  Crie oportunidades para atrair candidatos qualificados.
                </p>
                <Link
                  href="/empresa/vagas/nova"
                  className="mt-2 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground transition-all hover:opacity-95 active:scale-95"
                >
                  <Plus className="size-3.5" />
                  Criar primeira vaga
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-card/60 backdrop-blur-sm">
              <ul className="divide-y divide-border-subtle/50">
                {recentVagas.map((vaga) => (
                  <li key={vaga.id} className="transition-colors hover:bg-muted/30">
                    <VagaRow vaga={vaga} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Talentos sugeridos */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Candidaturas recebidas
            </h2>
            <Link
              href="/empresa/candidatos"
              className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Explorar banco
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <CandidatesListSkeleton rows={4} />
          ) : (
            <div className="rounded-2xl border border-border-subtle/70 bg-card/60 backdrop-blur-sm">
              <ul className="divide-y divide-border-subtle/50">
                {candidaturas.length === 0 && <li className="p-6 text-sm text-muted-foreground">As candidaturas recebidas aparecerão aqui.</li>}
                {candidaturas.slice(0, 4).map((candidate) => (
                  <li
                    key={candidate.id}
                    className="group flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/30"
                  >
                    <Link href={`/empresa/candidatos/${encodeURIComponent(candidate.id)}`} className="flex w-full min-w-0 items-center gap-3">
                      <EntityAvatar name={candidate.candidatoNome} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                          {candidate.candidatoNome ?? "Candidato"}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {candidate.vagaTitulo}
                        </p>
                      </div>
                      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border-subtle/50 p-3 text-center">
                <Link
                  href="/empresa/candidatos"
                  className="inline-block text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Ver todos os candidatos →
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}