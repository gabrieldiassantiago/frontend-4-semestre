"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, MapPin, Search } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { InputWithIcon } from "@/components/ui/form-field"
import { VagaSelectionSkeleton, EmptyState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import { useCompanyVagas } from "@/lib/queries/use-vagas"
import { etapaLabel, ETAPA_DOT, etapasDaVaga, type Candidatura } from "@/lib/types/candidatura.types"
import { MODALIDADE_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { SegmentedControl } from "../segmented-control"
import { VagaPipelineScreen } from "./vaga-pipeline-screen"

type JobFilter = "ativas" | "pausadas" | "todas"

function VagaSelectionScreen({ vagas, loading }: { vagas: Vaga[]; loading: boolean }) {
  const { candidaturas } = useCandidaturasEmpresa()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<JobFilter>("ativas")

  const byJob = useMemo(() => {
    const map = new Map<string, Candidatura[]>()
    for (const item of candidaturas) map.set(item.vagaId, [...(map.get(item.vagaId) ?? []), item])
    return map
  }, [candidaturas])

  const counts = {
    ativas: vagas.filter((v) => v.ativa).length,
    pausadas: vagas.filter((v) => !v.ativa).length,
    todas: vagas.length,
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR")
    return vagas
      .filter((v) => (filter === "ativas" ? v.ativa : filter === "pausadas" ? !v.ativa : true))
      .filter((v) => !term || `${v.titulo} ${v.cidade} ${v.estado}`.toLocaleLowerCase("pt-BR").includes(term))
      .sort((a, b) => (byJob.get(b.id)?.length ?? 0) - (byJob.get(a.id)?.length ?? 0))
  }, [vagas, query, filter, byJob])

  return (
    <PageShell className="max-w-[1380px]">
      <PageHeader
        title="Processos seletivos"
        description="Escolha uma vaga para acompanhar o funil e movimentar os candidatos entre as etapas."
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Filtrar vagas"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ativas", label: "Ativas", count: counts.ativas },
            { value: "pausadas", label: "Pausadas", count: counts.pausadas },
            { value: "todas", label: "Todas", count: counts.todas },
          ]}
        />
        <InputWithIcon
          icon={Search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar vaga por título ou cidade"
          aria-label="Buscar vaga"
          wrapperClassName="w-full sm:w-80"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <VagaSelectionSkeleton rows={3} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title={query ? "Nenhuma vaga encontrada" : "Nenhuma vaga nesta lista"}
            description={query ? "Tente outro termo de busca." : "Publique ou reative vagas para acompanhar seus processos."}
            action={
              <Link href={ROUTES.company.newJob} className="btn-primary">
                Criar vaga
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((vaga) => (
              <li key={vaga.id} className="flex">
                <JobPipelineCard vaga={vaga} candidaturas={byJob.get(vaga.id) ?? []} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}

function JobPipelineCard({ vaga, candidaturas }: { vaga: Vaga; candidaturas: Candidatura[] }) {
  const flow = etapasDaVaga(vaga.etapas)
  const active = candidaturas.filter((item) => item.status === "EM_ANDAMENTO")
  const approved = candidaturas.filter((item) => item.status === "APROVADA").length
  const awaiting = active.filter((item) => item.etapaAtual === flow[0]).length
  const perStage = flow.map((etapa) => ({ etapa, count: active.filter((item) => item.etapaAtual === etapa).length }))

  return (
    <Link
      href={`${ROUTES.company.processes}?vaga=${encodeURIComponent(vaga.id)}`}
      className="group flex w-full min-w-0 flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-[0_2px_8px_-4px_rgba(32,29,29,0.08)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_16px_40px_-20px_rgba(32,29,29,0.22)] motion-reduce:transform-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-primary-subtle text-primary"><BriefcaseBusiness aria-hidden className="size-5" strokeWidth={1.5} /></span>
          <h2 className="break-words text-lg font-semibold leading-7 tracking-tight text-foreground group-hover:text-primary">{vaga.titulo}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-1 text-xs leading-5 text-muted-foreground">
            <MapPin aria-hidden className="size-3 shrink-0" />
            {vaga.cidade}, {vaga.estado} · {MODALIDADE_LABELS[vaga.modalidade]}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            vaga.ativa ? "bg-success-subtle text-success-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <span aria-hidden className={cn("size-1.5 rounded-full", vaga.ativa ? "bg-success" : "bg-subtle-foreground")} />
          {vaga.ativa ? "Ativa" : "Pausada"}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-4">
        {[
          ["Candidatos", candidaturas.length],
          ["Em andamento", active.length],
          ["Aprovados", approved],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-2xl font-medium tracking-tight tabular-nums text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-5 mt-5">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          {active.length > 0 &&
            perStage
              .filter((stage) => stage.count > 0)
              .map((stage) => (
                <span key={stage.etapa} className={ETAPA_DOT[stage.etapa] || "bg-primary"} style={{ width: `${(stage.count / active.length) * 100}%` }} />
              ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {active.length === 0
            ? `${flow.length} etapas · nenhum candidato em andamento`
            : perStage
                .filter((stage) => stage.count > 0)
                .map((stage) => `${stage.count} em ${etapaLabel(stage.etapa, candidaturas.flatMap(item => item.etapasVaga ?? [])).toLowerCase()}`)
                .join(" · ")}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-subtle pt-4 text-sm">
        {awaiting > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-subtle-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {awaiting} {awaiting === 1 ? "aguarda" : "aguardam"} triagem
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{flow.length} etapas no processo</span>
        )}
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          Abrir funil
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export function CompanyProcessesScreen({ vagaId }: { vagaId?: string }) {
  const { vagas, loading } = useCompanyVagas()
  const vagaSelecionada = vagas.find((vaga: Vaga) => vaga.id === vagaId)

  if (vagaSelecionada) return <VagaPipelineScreen vaga={vagaSelecionada} />
  return <VagaSelectionScreen vagas={vagas} loading={loading} />
}
