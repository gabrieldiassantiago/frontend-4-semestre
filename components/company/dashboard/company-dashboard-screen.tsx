"use client"

import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Plus,
  UsersRound,
} from "lucide-react"

import { useCompanyVagas } from "@/lib/hooks/useCompanyVagas"
import { MOCK_CANDIDATES } from "@/lib/data/mock-candidates"
import { PageHeader, PageShell } from "@/components/ui/page"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { CardSkeleton, EmptyState } from "@/components/ui/states"
import { VagaRow } from "../vagas/vaga-row"

export function CompanyDashboardScreen() {
  const { vagas, loading } = useCompanyVagas()
  const activeCount = vagas.filter((vaga) => vaga.ativa).length
  const recentVagas = vagas.slice(0, 4)

  return (
    <PageShell>
      <PageHeader
        eyebrow="Visão geral"
        title="Painel da empresa"
        description="Acompanhe suas vagas publicadas e os candidatos mais promissores."
        actions={
          <Link href="/empresa/vagas/nova" className="btn-primary">
            <Plus className="size-4" aria-hidden />
            Publicar vaga
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Vagas ativas"
          value={loading ? "—" : activeCount}
          note={loading ? "Carregando" : `${vagas.length} no total`}
          icon={BriefcaseBusiness}
          tone="primary"
        />
        <StatCard label="Candidatos" value="—" note="Em breve" icon={UsersRound} tone="success" />
        <StatCard label="Entrevistas" value="—" note="Em breve" icon={CalendarClock} tone="warning" />
        <StatCard label="Taxa de avanço" value="—" note="Em breve" icon={CheckCircle2} tone="info" />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-6">
            <h2 className="font-bold tracking-tight text-foreground">Vagas recentes</h2>
            <Link
              href="/empresa/vagas"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver tudo
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {loading ? (
            <div className="p-5">
              <CardSkeleton rows={3} />
            </div>
          ) : recentVagas.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={BriefcaseBusiness}
                title="Nenhuma vaga publicada"
                description="Publique sua primeira vaga para começar a receber candidaturas."
                action={
                  <Link href="/empresa/vagas/nova" className="btn-primary">
                    <Plus className="size-4" aria-hidden />
                    Publicar vaga
                  </Link>
                }
                className="border-0 bg-transparent py-8"
              />
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {recentVagas.map((vaga) => (
                <li key={vaga.id}>
                  <VagaRow vaga={vaga} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="font-bold tracking-tight text-foreground">Melhores candidatos</h2>
              <Badge variant="warning" size="sm">
                Demonstração
              </Badge>
            </div>
            <Link
              href="/empresa/candidatos"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver tudo
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ul className="divide-y divide-border-subtle">
            {MOCK_CANDIDATES.slice(0, 4).map((candidate) => (
              <li
                key={candidate.name}
                className="flex items-center gap-3.5 p-4 transition-colors hover:bg-muted/60 sm:px-6"
              >
                <EntityAvatar name={candidate.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{candidate.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{candidate.role}</p>
                </div>
                <span className="text-sm font-bold tabular-nums text-success-foreground">
                  {candidate.score}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  )
}
