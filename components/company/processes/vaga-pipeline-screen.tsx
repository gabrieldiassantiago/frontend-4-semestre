"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  ChevronLeft,
  ExternalLink,
  Inbox,
  KanbanSquare,
  List,
  MapPin,
  MessageSquareQuote,
  Pencil,
  RefreshCw,
  Search,
  Users,
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
import {
  ETAPA_DOT,
  ETAPA_SHORT_LABELS,
  etapasDaVaga,
  type Candidatura,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"
import { MODALIDADE_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { SegmentedControl } from "../segmented-control"
import { CandidaturaDetailPanel } from "./candidatura-detail-panel"
import { StageProgress } from "./stage-progress"

type StatusFilter = "todos" | Extract<StatusCandidatura, "EM_ANDAMENTO" | "APROVADA" | "REPROVADA">
type View = "quadro" | "lista"

export function VagaPipelineScreen({ vaga }: { vaga: Vaga }) {
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState<StatusFilter>("todos")
  const [view, setView] = useState<View>("quadro")
  const [selected, setSelected] = useState<Candidatura | null>(null)

  const { candidaturas: todas, loading, refreshing, error, refetch } = useCandidaturasEmpresa()
  const fluxo = useMemo(() => etapasDaVaga(vaga.etapas), [vaga.etapas])
  const daVaga = useMemo(() => todas.filter((item) => item.vagaId === vaga.id), [todas, vaga.id])

  const counts = {
    todos: daVaga.length,
    EM_ANDAMENTO: daVaga.filter((item) => item.status === "EM_ANDAMENTO").length,
    APROVADA: daVaga.filter((item) => item.status === "APROVADA").length,
    REPROVADA: daVaga.filter((item) => item.status === "REPROVADA" || item.status === "CANCELADA").length,
  }

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR")
    return daVaga
      .filter((item) =>
        status === "todos" ? true : status === "REPROVADA" ? item.status === "REPROVADA" || item.status === "CANCELADA" : item.status === status,
      )
      .filter(
        (item) =>
          !termo ||
          [item.candidatoNome, item.candidatoEmail, item.candidatoHeadline]
            .filter(Boolean)
            .some((campo) => (campo as string).toLocaleLowerCase("pt-BR").includes(termo)),
      )
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
  }, [daVaga, busca, status])

  const colunas = useMemo(() => {
    const map = new Map<string, Candidatura[]>(fluxo.map((etapa) => [etapa, []]))
    visiveis.forEach((item) => map.get(item.etapaAtual)?.push(item))
    return map
  }, [fluxo, visiveis])

  const temFiltro = Boolean(busca.trim()) || status !== "todos"

  return (
    <PageShell className="max-w-none">
      <Link
        href={ROUTES.company.processes}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Processos seletivos
      </Link>

      <header className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{vaga.titulo}</h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                vaga.ativa ? "bg-success-subtle text-success-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", vaga.ativa ? "bg-success" : "bg-subtle-foreground")} />
              {vaga.ativa ? "Recebendo candidaturas" : "Pausada"}
            </span>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin aria-hidden className="size-3.5" />
            {vaga.cidade}, {vaga.estado} · {MODALIDADE_LABELS[vaga.modalidade]} · {fluxo.length} etapas
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" onClick={() => refetch()} className="btn-ghost" aria-label="Atualizar funil">
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <Link href={`/vaga/${vaga.id}`} target="_blank" className="btn-secondary">
            <ExternalLink aria-hidden className="size-4" />
            Página pública
          </Link>
          <Link href={ROUTES.company.editJob(vaga.id)} className="btn-secondary">
            <Pencil aria-hidden className="size-4" />
            Editar vaga
          </Link>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3 border-y border-border py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputWithIcon
            icon={Search}
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar candidato"
            aria-label="Buscar candidato"
            wrapperClassName="sm:w-72"
          />
          <SegmentedControl
            label="Filtrar por situação"
            value={status}
            onChange={setStatus}
            options={[
              { value: "todos", label: "Todos", count: counts.todos },
              { value: "EM_ANDAMENTO", label: "Em andamento", count: counts.EM_ANDAMENTO },
              { value: "APROVADA", label: "Aprovados", count: counts.APROVADA },
              { value: "REPROVADA", label: "Encerrados", count: counts.REPROVADA },
            ]}
          />
        </div>
        <div role="group" aria-label="Modo de visualização" className="inline-flex self-start rounded-lg border border-border p-0.5 lg:self-auto">
          {(
            [
              ["quadro", "Quadro", KanbanSquare],
              ["lista", "Lista", List],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
                view === value ? "bg-primary-subtle text-primary-subtle-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6">
          <KanbanSkeleton />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => refetch()} className="btn-secondary">
                Tentar novamente
              </button>
            }
          />
        </div>
      ) : visiveis.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={temFiltro ? Inbox : Users}
          title={temFiltro ? "Nenhuma candidatura com esses filtros" : "Nenhuma candidatura ainda"}
          description={temFiltro ? "Ajuste os filtros para ver outros candidatos." : "Quando alguém se candidatar a esta vaga, o processo aparece aqui."}
          action={
            temFiltro ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("todos")
                  setBusca("")
                }}
                className="btn-secondary"
              >
                Limpar filtros
              </button>
            ) : undefined
          }
        />
      ) : view === "quadro" ? (
        <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex w-max min-w-full gap-3">
            {fluxo.map((etapa) => {
              const items = colunas.get(etapa) ?? []
              return (
                <section
                  key={etapa}
                  aria-labelledby={`col-${etapa}`}
                  className="flex w-64 shrink-0 grow basis-64 flex-col rounded-2xl border border-border-subtle bg-muted/60"
                >
                  <div className="flex items-center justify-between gap-2 px-3.5 pb-2 pt-3.5">
                    <h2 id={`col-${etapa}`} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
                      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", ETAPA_DOT[etapa])} />
                      <span className="truncate">{ETAPA_SHORT_LABELS[etapa]}</span>
                    </h2>
                    <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <p className="mx-2.5 mb-2.5 rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-subtle-foreground">
                      Nenhum candidato
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2 p-2.5 pt-1">
                      {items.map((item) => (
                        <li key={item.id}>
                          <CandidateCard item={item} onOpen={() => setSelected(item)} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      ) : (
        <CandidateTable items={visiveis} onOpen={setSelected} />
      )}

      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} side="right" title="Avaliar candidatura" panelClassName="w-[min(32rem,94vw)]">
        {selected && (
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CandidaturaDetailPanel candidaturaId={selected.id} />
            </div>
            <Link
              href={ROUTES.company.candidate(selected.id)}
              className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-muted"
            >
              Ver perfil completo do candidato
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
        )}
      </Sheet>
    </PageShell>
  )
}

function CandidateCard({ item, onOpen }: { item: Candidatura; onOpen: () => void }) {
  const closed = item.status !== "EM_ANDAMENTO"
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={cn(
        "group w-full rounded-xl border border-border bg-card p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-primary/40 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-primary",
        closed && "opacity-75",
      )}
    >
      <div className="flex items-start gap-2.5">
        <EntityAvatar name={item.candidatoNome} src={item.candidatoImagemUrl} size="sm" className="rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{item.candidatoNome ?? "Candidato"}</p>
          <p className="truncate text-xs text-muted-foreground">{item.candidatoHeadline || item.candidatoEmail || "Perfil profissional"}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-subtle-foreground">
        <span>{item.createdAt ? `Inscrito ${formatRelativeDate(item.createdAt)}` : "Inscrito"}</span>
        <span className="flex items-center gap-2">
          {(item.totalFeedbacks ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1" title="Feedbacks registrados">
              <MessageSquareQuote aria-hidden className="size-3.5" />
              {item.totalFeedbacks}
              <span className="sr-only">feedbacks</span>
            </span>
          )}
          {closed && <StatusBadge status={item.status} size="sm" />}
        </span>
      </div>
    </button>
  )
}

function CandidateTable({ items, onOpen }: { items: Candidatura[]; onOpen: (item: Candidatura) => void }) {
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
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-muted/60">
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
                <button type="button" onClick={() => onOpen(item)} aria-haspopup="dialog" className="btn-ghost min-h-9 px-3 text-xs">
                  Avaliar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
