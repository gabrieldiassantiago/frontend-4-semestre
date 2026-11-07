"use client"
import { useMemo, useState } from "react"
import Link from "next/link"

import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  FileText,
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
const STAGE_COLORS = ["bg-[#7771df]", "bg-[#c28657]", "bg-[#d4ac54]", "bg-[#6a9cb3]", "bg-[#8e83aa]", "bg-[#67a08f]"]

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

  return (
    <PageShell className="max-w-none pb-8">
      <Link
        href={ROUTES.company.processes}
        className="inline-flex items-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground"><ChevronLeft aria-hidden className="size-3.5" />Processos seletivos</Link>

      <header className="mt-5 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1
              className="break-words text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-[28px] sm:leading-10">{vaga.titulo}</h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium",
                vaga.ativa ? "bg-primary-subtle text-primary-subtle-foreground" : "bg-muted text-muted-foreground",
              )}><span
                aria-hidden
                className={cn("size-1.5 rounded-full", vaga.ativa ? "bg-primary" : "bg-subtle-foreground")} />{vaga.ativa ? "Em recrutamento" : "Vaga pausada"}</span>
          </div>
          <div
            className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
            <span>{CATEGORIA_LABELS[vaga.categoria] ?? "Oportunidade"}</span><span aria-hidden className="size-1 rounded-full bg-border-strong" /><span>{MODALIDADE_LABELS[vaga.modalidade]}</span><span aria-hidden className="size-1 rounded-full bg-border-strong" /><span className="inline-flex items-center gap-1.5"><Users aria-hidden className="size-3.5" />{loading ? "Carregando candidaturas…" : `${daVaga.length} ${daVaga.length === 1 ? "candidatura" : "candidaturas"}`}</span>
            {vaga.cidade && <><span aria-hidden className="size-1 rounded-full bg-border-strong" /><span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-3" />{[vaga.cidade, vaga.estado].filter(Boolean).join(", ")}</span></>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => void refetch()}
            aria-label="Atualizar candidaturas"
            className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"><RefreshCw aria-hidden className={cn("size-4", refreshing && "animate-spin")} /></button>
          <Link
            href={`/vaga/${vaga.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary min-h-10 rounded-xl px-3 text-xs"><ExternalLink aria-hidden className="size-3.5" />Página pública</Link>
          <Link href={ROUTES.company.editJob(vaga.id)} className="btn-secondary min-h-10 rounded-xl px-3 text-xs"><Pencil aria-hidden className="size-3.5" />Editar vaga</Link>
        </div>
      </header>

      <div
        role="group"
        aria-label="Filtrar candidaturas por situação"
        className="mt-7 flex gap-5 overflow-x-auto border-b border-border sm:gap-7">
        {([
          ["todos", "Todas as candidaturas", KanbanSquare],
          ["EM_ANDAMENTO", "Em andamento", Users],
          ["APROVADA", "Aprovadas", UserRoundCheck],
          ["REPROVADA", "Encerradas", Inbox],
        ] as const).map(([value, label, Icon]) => (<button
          key={value}
          type="button"
          aria-pressed={status === value}
          onClick={() => setStatus(value)}
          className={cn(
            "-mb-px inline-flex min-h-14 shrink-0 items-center gap-2 border-b-2 text-xs font-medium transition-colors",
            status === value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
          )}>
          <Icon aria-hidden className="size-4" />{label}<span
            className={cn(
              "ml-1 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
              status === value ? "bg-primary-subtle" : "bg-muted",
            )}>{counts[value]}</span>
        </button>))}
      </div>

      <div className="flex flex-col gap-3 py-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Modo de visualização"
            className="inline-flex rounded-xl border border-border bg-card p-1">
            {([["quadro", "Quadro", KanbanSquare], ["lista", "Lista", List]] as const).map(([value, label, Icon]) => (<button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors",
                view === value ? "bg-primary-subtle font-medium text-primary-subtle-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground",
              )}><Icon aria-hidden className="size-3.5" />{label}</button>))}
          </div>
          <PipelineSelect label="Filtrar por etapa" value={stage} onChange={setStage} icon={Layers3}>
            <option value="">Todas as etapas</option>{stages.map(id => <option key={id} value={id}>{stageName(id)}</option>)}
          </PipelineSelect>
          <PipelineSelect
            label="Ordenar candidaturas"
            value={sort}
            onChange={value => setSort(value as Sort)}
            icon={ArrowDownWideNarrow}>
            <option value="recentes">Mais recentes</option><option value="antigas">Mais antigas</option><option value="nome">Nome A–Z</option>
          </PipelineSelect>
          <button
            type="button"
            aria-pressed={withResume}
            onClick={() => setWithResume(prev => !prev)}
            className={cn(
              "inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3 text-xs transition-colors",
              withResume ? "border-primary/30 bg-primary-subtle text-primary-subtle-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}><FileText aria-hidden className="size-3.5" />Com currículo</button>
        </div>
        <InputWithIcon
          icon={Search}
          type="search"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder="Buscar candidato"
          aria-label="Buscar candidato"
          wrapperClassName="w-full sm:max-w-sm 2xl:w-64"
          className="min-h-[42px] text-xs" />
      </div>

      <div
        className="mb-4 flex min-h-6 flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"
        aria-live="polite">
        <p>{loading ? "Carregando…" : `${visiveis.length} ${visiveis.length === 1 ? "candidatura" : "candidaturas"}${temFiltro ? ` de ${daVaga.length}` : " no processo"}`}<span aria-hidden className="mx-2 text-border-strong">/</span>{shownStages.length}etapas</p>
        {temFiltro ? <button
          type="button"
          onClick={clearFilters}
          className="inline-flex min-h-7 items-center gap-1 rounded-md px-1 text-xs text-strong-foreground hover:text-primary"><X aria-hidden className="size-3" />Limpar filtros</button> : <p className="hidden sm:block">Selecione um candidato para avaliar a candidatura</p>}
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
        className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-5 focus-visible:rounded-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex w-max min-w-full items-start gap-4">
          {shownStages.map((id, index) => {
            const items = colunas.get(id) ?? []

            return (
              <section
                key={id}
                aria-labelledby={`col-${id}`}
                className="w-[min(320px,calc(100vw-3rem))] shrink-0 rounded-[26px] bg-[#f1f2f3] p-3 sm:w-[332px]">
                <div className="flex min-h-14 items-center justify-between gap-3 px-2 pb-2">
                  <h2
                    id={`col-${id}`}
                    className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium leading-5 tracking-[-0.015em] text-foreground"><span
                      aria-hidden
                      className={cn("size-2 shrink-0 rounded-full", STAGE_COLORS[stages.indexOf(id) % STAGE_COLORS.length])} /><span className="break-words">{stageName(id)}</span></h2>
                  <span
                    className="shrink-0 px-1 text-xs tabular-nums text-muted-foreground"
                    aria-label={`${items.length} candidaturas nesta etapa`}>{items.length}</span>
                </div>
                {items.length ? <ul className="flex flex-col gap-3">{items.map(
                    item => <li key={item.id}><PipelineCandidateCard item={item} onOpen={() => setSelectedId(item.id)} /></li>,
                  )}</ul> : (<div
                  className="flex min-h-48 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#dddee1] px-6 text-center"><span className="mb-3 grid size-9 place-items-center rounded-full bg-card/80 text-subtle-foreground"><Inbox aria-hidden className="size-4" strokeWidth={1.5} /></span><p className="text-xs font-medium text-muted-foreground">Nenhum candidato nesta etapa</p><p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{index === 0 ? "As novas candidaturas aparecem aqui." : "Os candidatos aparecem aqui ao avançar no processo."}</p></div>)}
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

function PipelineSelect(
  {
    label,
    value,
    onChange,
    icon: Icon,
    children,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    icon: typeof Layers3
    children: React.ReactNode
  },
) {
  return (
    <div className="relative max-w-full"><Icon
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><select
        aria-label={label}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="min-h-[42px] max-w-52 appearance-none rounded-xl border border-border bg-card py-2 pl-9 pr-8 text-xs text-strong-foreground">{children}</select><ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" /></div>
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
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
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
