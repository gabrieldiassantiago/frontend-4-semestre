"use client"
import { Select, type SelectOption } from "@/components/ui/select"
import { useMemo, useState } from "react"
import Link from "next/link"

import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ExternalLink,
  FileText,
  Hourglass,
  Inbox,
  KanbanSquare,
  Layers3,
  List,
  MapPin,
  Pencil,
  RefreshCw,
  Search,
  UserRoundCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"

import { PageShell } from "@/components/ui/page"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { InputWithIcon } from "@/components/ui/form-field"
import { Sheet } from "@/components/ui/sheet"
import { KanbanSkeleton, EmptyState, ErrorState } from "@/components/ui/states"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatRelativeDate } from "@/lib/format"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import { etapaLabel, etapasDaVaga, type Candidatura } from "@/lib/types/candidatura.types"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { filterPipelineCandidates, pipelineStages, type PipelineStatus, type PipelineSort } from "@/lib/utils/pipeline"
import { CandidaturaDetailPanel } from "./candidatura-detail-panel"
import { PipelineCandidateCard } from "./pipeline-candidate-card"
import { StageProgress } from "./stage-progress"
type StatusFilter = PipelineStatus
type View = "quadro" | "lista"
type Sort = PipelineSort

const NEW_WEEK_MS = 7 * 86_400_000

export function VagaPipelineScreen(
  {
    vaga,
  }: {
    vaga: Vaga
  },
) {
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState<StatusFilter>("todos")
  const [view, setView] = useState<View>("quadro")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [stage, setStage] = useState("")
  const [sort, setSort] = useState<Sort>("recentes")
  const [withResume, setWithResume] = useState(false)

  const {
    candidaturas: todas,
    loading,
    refreshing,
    error,
    refetch,
  } = useCandidaturasEmpresa()

  const fluxo = useMemo(() => etapasDaVaga(vaga.etapas), [vaga.etapas])
  const daVaga = useMemo(() => todas.filter(item => item.vagaId === vaga.id), [todas, vaga.id])

  // Preserva candidaturas de etapas antigas que não aparecem mais na configuração da vaga.
  const stages = useMemo(() => pipelineStages(fluxo, daVaga), [fluxo, daVaga])

  const stageName = (id: string) => etapaLabel(id, vaga.etapas, daVaga.find(item => item.etapaAtual === id)?.etapaAtualDescricao)

  const counts = {
    todos: daVaga.length,
    EM_ANDAMENTO: daVaga.filter(item => item.status === "EM_ANDAMENTO").length,
    APROVADA: daVaga.filter(item => item.status === "APROVADA").length,
    REPROVADA: daVaga.filter(item => item.status === "REPROVADA" || item.status === "CANCELADA").length,
  }

  const novasNaSemana = useMemo(
    () => daVaga.filter(item => item.createdAt && Date.now() - new Date(item.createdAt).getTime() <= NEW_WEEK_MS).length,
    [daVaga],
  )

  const visiveis = useMemo(() => filterPipelineCandidates(daVaga, {
    busca,
    status,
    stage,
    sort,
    withResume,
  }), [daVaga, busca, status, stage, sort, withResume])

  const colunas = useMemo(() => {
    const map = new Map<string, Candidatura[]>(stages.map(etapa => [etapa, []]))
    visiveis.forEach(item => map.get(item.etapaAtual)?.push(item))
    return map
  }, [stages, visiveis])

  const temFiltro = Boolean(busca.trim() || stage || withResume || status !== "todos")
  const shownStages = stage ? stages.filter(id => id === stage) : stages

  function clearFilters() {
    setBusca("")
    setStatus("todos")
    setStage("")
    setWithResume(false)
  }

  const metrics: { value: StatusFilter; label: string; count: number; hint?: string }[] = [
    { value: "todos", label: "Candidaturas", count: counts.todos, hint: novasNaSemana > 0 ? `+${novasNaSemana} na semana` : undefined },
    { value: "EM_ANDAMENTO", label: "Em andamento", count: counts.EM_ANDAMENTO },
    { value: "APROVADA", label: "Aprovadas", count: counts.APROVADA },
    { value: "REPROVADA", label: "Encerradas", count: counts.REPROVADA },
  ]

  return (
    <PageShell className="max-w-none pb-8">
      <Link
        href={ROUTES.company.processes}
        className="inline-flex items-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground"><ChevronLeft aria-hidden className="size-3.5" />Processos seletivos</Link>

      {/* Cabeçalho da vaga */}
      <header className="mt-4 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground">{vaga.titulo}</h1>
            <span className={cn("text-sm font-medium", vaga.ativa ? "text-success-foreground" : "text-muted-foreground")}>{vaga.ativa ? "Em recrutamento" : "Vaga pausada"}</span>
          </div>
          <div
            className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 text-muted-foreground">
            <span>{CATEGORIA_LABELS[vaga.categoria] ?? "Oportunidade"}</span><span aria-hidden className="size-1 rounded-full bg-border-strong" /><span>{MODALIDADE_LABELS[vaga.modalidade]}</span>
            {vaga.cidade && <><span aria-hidden className="size-1 rounded-full bg-border-strong" /><span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-3" />{[vaga.cidade, vaga.estado].filter(Boolean).join(", ")}</span></>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => void refetch()}
            aria-label="Atualizar candidaturas"
            className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"><RefreshCw aria-hidden className={cn("size-4", refreshing && "animate-spin")} /></button>
          <Link
            href={`/vaga/${vaga.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary min-h-10 rounded-lg px-3 text-sm">Página pública<ExternalLink aria-hidden className="size-3.5" /></Link>
          <Link href={ROUTES.company.editJob(vaga.id)} className="btn-primary min-h-10 rounded-lg px-4 text-sm">Editar vaga</Link>
        </div>
      </header>

      {/* Métricas: também funcionam como filtro de situação */}
      <div
        role="group"
        aria-label="Filtrar candidaturas por situação"
        className="mt-6 flex gap-6 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {metrics.map(({ value, label, count, hint }) => {
          const active = status === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setStatus(value)}
              className={cn(
                "-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}>
              {label}
              <span className={cn("tabular-nums", active ? "text-primary" : "text-subtle-foreground")}>{loading ? "–" : count}</span>
              {hint && <span className="text-xs font-normal text-success-foreground">{hint}</span>}
            </button>
          )
        })}
      </div>

      {/* Barra de ferramentas */}
      <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div
          role="group"
          aria-label="Modo de visualização"
          className="inline-flex w-fit rounded-lg bg-muted p-1">
          {([["quadro", "Quadro", KanbanSquare], ["lista", "Lista", List]] as const).map(([value, label, Icon]) => (<button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors",
              view === value ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}><Icon aria-hidden className="size-4" />{label}</button>))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PipelineSelect
            label="Filtrar por etapa"
            value={stage}
            onChange={setStage}
            icon={Layers3}
            options={[{ value: "", label: "Todas as etapas" }, ...stages.map((id) => ({ value: id, label: stageName(id) }))]}
          />
          <PipelineSelect
            label="Ordenar candidaturas"
            value={sort}
            onChange={value => setSort(value as Sort)}
            icon={ArrowDownWideNarrow}
            options={[
              { value: "recentes", label: "Mais recentes" },
              { value: "antigas", label: "Mais antigas" },
              { value: "nome", label: "Nome A–Z" },
            ]}
          />
          <button
            type="button"
            aria-pressed={withResume}
            onClick={() => setWithResume(prev => !prev)}
            className={cn(
              "inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
              withResume ? "border-primary/40 bg-primary-subtle text-primary-subtle-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}>Com currículo</button>
          <InputWithIcon
            icon={Search}
            type="search"
            value={busca}
            onChange={event => setBusca(event.target.value)}
            placeholder="Buscar candidato"
            aria-label="Buscar candidato"
            wrapperClassName="w-full sm:w-64"
            className="min-h-[42px] text-sm" />
        </div>
      </div>

      <div
        className="my-4 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"
        aria-live="polite">
        <p>{loading ? "Carregando…" : `${visiveis.length} ${visiveis.length === 1 ? "candidatura" : "candidaturas"}${temFiltro ? ` de ${daVaga.length}` : " no processo"}`}<span aria-hidden className="mx-2 text-border-strong">/</span>{shownStages.length} {shownStages.length === 1 ? "etapa" : "etapas"}</p>
        {temFiltro ? <button
          type="button"
          onClick={clearFilters}
          className="inline-flex min-h-7 items-center gap-1 rounded-md px-1 font-semibold text-primary hover:underline"><X aria-hidden className="size-3" />Limpar filtros</button> : <p className="hidden sm:block">Selecione um candidato para avaliar a candidatura</p>}
      </div>

      {loading ? <KanbanSkeleton /> : error ? (<ErrorState
        description={error}
        action={<button type="button" onClick={() => void refetch()} className="btn-secondary">Tentar novamente</button>} />) : temFiltro && visiveis.length === 0 ? (<EmptyState
        icon={Search}
        title="Nenhuma candidatura encontrada"
        description="Experimente outra busca ou ajuste os filtros deste processo."
        action={<button type="button" onClick={clearFilters} className="btn-secondary">Limpar filtros</button>} />) : view === "quadro" ? (<div
        role="region"
        aria-label="Quadro de candidaturas por etapa"
        tabIndex={0}
        className="-mx-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-4 pb-5 focus-visible:rounded-xl sm:-mx-6 sm:snap-none sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex w-max min-w-full items-start gap-4">
          {shownStages.map((id, index) => {
            const items = colunas.get(id) ?? []
            return (
              <section
                key={id}
                aria-labelledby={`col-${id}`}
                className="w-[min(320px,calc(100vw-3rem))] shrink-0 snap-start rounded-xl bg-surface p-2.5 sm:w-[336px]">
                <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1">
                  <h2 id={`col-${id}`} className="min-w-0 truncate text-sm font-semibold text-foreground">{stageName(id)}</h2>
                  <span className="text-sm tabular-nums text-muted-foreground" aria-label={`${items.length} candidaturas nesta etapa`}>{items.length}</span>
                </div>
                {items.length ? <ul className="flex flex-col gap-3">{items.map(
                    item => <li key={item.id}><PipelineCandidateCard item={item} onOpen={() => setSelectedId(item.id)} /></li>,
                  )}</ul> : (<div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border-strong/60 px-6 text-center"><p className="text-xs leading-5 text-muted-foreground">{index === 0 ? "As novas candidaturas aparecem aqui." : "Nenhum candidato nesta etapa."}</p></div>)}
              </section>
            )
          })}
          {!shownStages.length && <EmptyState
            icon={Layers3}
            title="Etapas não disponíveis"
            description="Confira a configuração do processo seletivo desta vaga." />}
        </div>
      </div>) : visiveis.length ? <CandidateTable items={visiveis} onOpen={item => setSelectedId(item.id)} /> : <EmptyState
        icon={Users}
        title="Nenhuma candidatura ainda"
        description="As inscrições recebidas aparecerão aqui." />}

      <Sheet
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        side="right"
        title="Avaliar candidatura"
        panelClassName="w-[min(36rem,96vw)]">
        {selectedId && <div className="flex h-full min-h-0 flex-col"><div className="min-h-0 flex-1 overflow-y-auto"><CandidaturaDetailPanel candidaturaId={selectedId} /></div><Link
            href={ROUTES.company.candidate(selectedId)}
            className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-4 text-xs font-medium text-primary transition-colors hover:bg-muted">Ver perfil completo do candidato<ArrowUpRight aria-hidden className="size-4" /></Link></div>}
      </Sheet>
    </PageShell>
  )
}

function PipelineSelect({
  label,
  value,
  onChange,
  icon: Icon,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  icon: typeof Layers3
  options: SelectOption[]
}) {
  return (
    <div className="relative max-w-full">
      <Icon aria-hidden className="pointer-events-none absolute left-3 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Select aria-label={label} variant="pill" value={value} onValueChange={onChange} options={options} className="max-w-52 pl-9" />
    </div>
  )
}

function CandidateTable(
  {
    items,
    onOpen,
  }: {
    items: Candidatura[]
    onOpen: (item: Candidatura) => void
  },
) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">Candidaturas da vaga</caption>
        <thead className="border-b border-border-subtle text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">Candidato</th>
            <th scope="col" className="px-3 py-3 font-medium">Etapa</th>
            <th scope="col" className="px-3 py-3 font-medium">Situação</th>
            <th scope="col" className="px-3 py-3 font-medium">Inscrição</th>
            <th scope="col" className="px-5 py-3"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {items.map(item => (<tr key={item.id} className="transition-colors hover:bg-muted/60">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                <EntityAvatar name={item.candidatoNome} src={item.candidatoImagemUrl} size="sm" className="rounded-full" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{item.candidatoNome ?? "Candidato"}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.candidatoHeadline || item.candidatoEmail}</p>
                </div>
              </div>
            </td>
            <td className="px-3 py-3">
              <StageProgress item={item} />
            </td>
            <td className="px-3 py-3">
              <StatusBadge status={item.status} size="sm" />
            </td>
            <td className="px-3 py-3 text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</td>
            <td className="px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => onOpen(item)}
                aria-haspopup="dialog"
                className="btn-ghost min-h-9 px-3 text-xs">Avaliar
                                </button>
            </td>
          </tr>))}
        </tbody>
      </table>
    </div>
  )
}
