"use client"

import { resumeHref } from "@/lib/utils/resume"
import { etapaLabel } from "@/lib/types/candidatura.types"
import { ROUTES } from "@/lib/config/routes"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  Clock,
  FileText,
  History,
  LoaderCircle,
  LogOut,
  Layers3,
  Mail,
  MessageSquare,
  RefreshCw,
  Video,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useCandidatura, useConfirmarAgendamento, useDesistirCandidatura, useRecusarAgendamento } from "@/lib/queries/use-candidaturas"
import { useVaga } from "@/lib/queries/use-vagas"
import { getErrorMessage } from "@/lib/errors"
import { formatDate } from "@/lib/format"
import { isWebUrl } from "@/lib/utils/profile-validation"
import { Modal } from "@/components/ui/modal"
import { ErrorState, Skeleton } from "@/components/ui/states"
import { CompanyLogo } from "@/components/shared/company-logo"
import { NotaEstrelas, StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { CandidaturaChatButton } from "@/components/shared/chat/candidatura-chat"

import {
  ETAPA_HINTS,
  STATUS_LABELS,
  STATUS_AGENDAMENTO_LABELS,
  etapasDaVaga,
  isFinalizada,
  type Candidatura,
  type CandidaturaAgendamento,
  type CandidaturaFeedback,
  type CandidaturaHistorico,
} from "@/lib/types/candidatura.types"
import { descreverDias, diasDesde, DIAS_SEM_MOVIMENTACAO_ALERTA, entradaNaEtapaAtual } from "@/lib/utils/tempo-etapa"

const cardBase = "rounded-xl border border-border bg-card"

function SectionHeader(
  {
    id,
    title,
    description,
    aside,
  }: {
    id?: string
    icon?: typeof Clock
    title: string
    description?: string
    aside?: React.ReactNode
  },
) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0">
          <h2
            id={id}
            className="scroll-mt-36 text-sm font-semibold leading-6 tracking-tight text-foreground sm:text-base">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>}
        </div>
      </div>
      {aside}
    </div>
  )
}

function EmptyHint(
  {
    children,
  }: {
    icon?: typeof Clock
    children: React.ReactNode
  },
) {
  return (
    <div
      className="mt-5 rounded-lg border border-dashed border-border p-5 text-sm leading-6 text-muted-foreground">
      <p>{children}</p>
    </div>
  )
}

type TipoEvento = "inscricao" | "etapa" | "aprovada" | "reprovada" | "cancelada" | "feedback" | "agendamento"

interface EventoLinhaDoTempo {
  id: string
  em: string
  tipo: TipoEvento
  titulo: string
  detalhe?: string
  autor?: string
  href?: string
}

const EVENTO_ICONE: Record<TipoEvento, typeof Clock> = {
  inscricao: FileText,
  etapa: Layers3,
  aprovada: Check,
  reprovada: X,
  cancelada: LogOut,
  feedback: MessageSquare,
  agendamento: CalendarClock,
}

const EVENTO_COR: Record<TipoEvento, string> = {
  inscricao: "bg-surface text-muted-foreground ring-border",
  etapa: "bg-primary-subtle text-primary ring-primary/30",
  aprovada: "bg-success-subtle text-success-foreground ring-success-border",
  reprovada: "bg-danger-subtle text-danger-foreground ring-danger-border",
  cancelada: "bg-surface text-muted-foreground ring-border",
  feedback: "bg-primary-subtle text-primary ring-primary/30",
  agendamento: "bg-warning-subtle text-warning-foreground ring-warning/30",
}

/**
 * Junta histórico de etapas, feedbacks e agendamentos em uma única linha do tempo,
 * do mais recente para o mais antigo.
 */
function montarLinhaDoTempo(
  historico: CandidaturaHistorico[],
  feedbacks: CandidaturaFeedback[],
  agendamentos: CandidaturaAgendamento[],
  etapasVaga: Candidatura["etapasVaga"],
): EventoLinhaDoTempo[] {
  const eventos: EventoLinhaDoTempo[] = []

  for (const item of historico) {
    if (!item.createdAt) continue
    const etapa = etapaLabel(item.etapaNova, etapasVaga, item.etapaNovaDescricao)
    const base = { id: `h-${item.id}`, em: item.createdAt }

    if (!item.statusAnterior) {
      eventos.push({ ...base, tipo: "inscricao", titulo: "Você se candidatou", detalhe: `O processo começou na etapa ${etapa}.` })
    } else if (item.statusAnterior !== item.statusNovo && item.statusNovo === "APROVADA") {
      eventos.push({ ...base, tipo: "aprovada", titulo: "Candidatura aprovada", detalhe: item.observacao, autor: item.autorNome })
    } else if (item.statusAnterior !== item.statusNovo && item.statusNovo === "REPROVADA") {
      eventos.push({ ...base, tipo: "reprovada", titulo: "Processo encerrado pela empresa", detalhe: item.observacao, autor: item.autorNome })
    } else if (item.statusAnterior !== item.statusNovo && item.statusNovo === "CANCELADA") {
      eventos.push({ ...base, tipo: "cancelada", titulo: "Você desistiu do processo" })
    } else {
      eventos.push({ ...base, tipo: "etapa", titulo: `Avançou para ${etapa}`, detalhe: item.observacao, autor: item.autorNome })
    }
  }

  for (const feedback of feedbacks) {
    if (!feedback.createdAt) continue
    eventos.push({
      id: `f-${feedback.id}`,
      em: feedback.createdAt,
      tipo: "feedback",
      titulo: `Feedback recebido · ${etapaLabel(feedback.etapa, etapasVaga, feedback.etapaDescricao)}`,
      detalhe: feedback.titulo,
      autor: feedback.autorNome,
      href: "#application-feedback-title",
    })
  }

  for (const agendamento of agendamentos) {
    const em = agendamento.createdAt || agendamento.inicio
    if (!em) continue
    const quando = formatDate(agendamento.inicio, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    const situacao = agendamento.statusDescricao || STATUS_AGENDAMENTO_LABELS[agendamento.status]
    eventos.push({
      id: `a-${agendamento.id}`,
      em,
      tipo: "agendamento",
      titulo: `Convite: ${agendamento.titulo}`,
      detalhe: [quando && `Marcado para ${quando}`, situacao].filter(Boolean).join(" · "),
      autor: agendamento.criadoPorNome,
      href: "#application-appointments",
    })
  }

  return eventos.sort((a, b) => (Date.parse(b.em) || 0) - (Date.parse(a.em) || 0))
}

function LinhaDoTempo({ eventos }: { eventos: EventoLinhaDoTempo[] }) {
  if (!eventos.length)
    return <EmptyHint icon={History}>Ainda não há movimentações registradas.</EmptyHint>

  return (
    <ol className="mt-6">
      {eventos.map((evento, index) => {
        const Icone = EVENTO_ICONE[evento.tipo]
        return (
          <li key={evento.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < eventos.length - 1 && <span aria-hidden className="absolute bottom-0 left-[13px] top-8 w-px bg-border" />}
            <span
              aria-hidden
              className={cn("relative grid size-7 shrink-0 place-items-center rounded-full ring-1", EVENTO_COR[evento.tipo])}>
              <Icone className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="text-sm font-semibold leading-6">
                {evento.href ? <a href={evento.href} className="hover:underline">{evento.titulo}</a> : evento.titulo}
              </h3>
              {evento.detalhe && <p className="mt-1 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{evento.detalhe}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                <time dateTime={evento.em}>{formatDate(evento.em, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                {evento.autor && ` · ${evento.autor}`}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8" aria-busy="true">
      <span className="sr-only">Carregando candidatura</span>
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-6 h-48 rounded-2xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </main>
  )
}

type StatusAgendamento = CandidaturaAgendamento["status"]

const STATUS_STYLES: Record<StatusAgendamento, string> = {
  PENDENTE: "border-warning/25 bg-warning-subtle text-warning-foreground",
  CONFIRMADO: "border-success-border bg-success-subtle text-success-foreground",
  REALIZADO: "border-primary/20 bg-primary-subtle text-primary",
  NAO_COMPARECEU: "border-danger/20 bg-danger-subtle text-danger-foreground",
  CANCELADO: "border-border bg-surface text-muted-foreground",
  RECUSADO: "border-border bg-surface text-muted-foreground",
}

const CLOSED: StatusAgendamento[] = ["CANCELADO", "RECUSADO", "REALIZADO", "NAO_COMPARECEU"]

const fmtTime = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
})

const fmtWeekdayShort = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
})

const fmtMonthShort = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
})

const fmtLongDate = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return null
  }
}

/** "amanhã", "daqui a 3 dias", "daqui a 2 horas"... */
function relativeLabel(date: Date) {
  const rtf = new Intl.RelativeTimeFormat("pt-BR", {
    numeric: "auto",
  })

  const minutes = Math.round((date.getTime() - Date.now()) / 60_000)

  if (Math.abs(minutes) < 60)
    return rtf.format(minutes, "minute")

  const hours = Math.round(minutes / 60)

  if (Math.abs(hours) < 24)
    return rtf.format(hours, "hour")

  return rtf.format(Math.round(hours / 24), "day")
}

function googleCalendarUrl(item: CandidaturaAgendamento, start: Date) {
  const end = new Date(start.getTime() + item.duracaoMinutos * 60_000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.titulo,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: [item.mensagem, item.link].filter(Boolean).join("\n\n"),
    location: item.link,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function DateTile(
  {
    start,
    status,
  }: {
    start: Date
    status: StatusAgendamento
  },
) {
  const weekday = fmtWeekdayShort.format(start).replace(".", "")
  const month = fmtMonthShort.format(start).replace(".", "")
  const tone = status === "CONFIRMADO" ? "bg-primary text-primary-foreground border-primary" : status === "PENDENTE" ? "bg-card text-primary border-primary/30" : "bg-surface text-muted-foreground border-border"

  return (
    <div
      aria-hidden
      style={{
        width: 68,
        minWidth: 68,
        flex: "none",
      }}
      className={cn("flex flex-col items-center justify-center self-start rounded-xl border py-2.5", tone)}>
      <span className="block text-xs font-medium leading-4 opacity-80">{weekday}</span>
      <span className="block text-[1.65rem] font-semibold leading-8 tabular-nums">{start.getDate()}</span>
      <span className="block text-xs font-medium leading-4 opacity-80">{month}</span>
    </div>
  )
}

function AgendamentoCard(
  {
    item,
    busy,
    disabled,
    onRespond,
    responding,
  }: {
    item: CandidaturaAgendamento
    busy: boolean
    disabled: boolean
    responding: "confirmar" | "recusar" | null
    onRespond: (item: CandidaturaAgendamento, acao: "confirmar" | "recusar") => void
  },
) {
  const start = new Date(item.inicio)
  const validDate = !Number.isNaN(start.getTime())
  const end = validDate ? new Date(start.getTime() + item.duracaoMinutos * 60_000) : null
  const pendente = item.status === "PENDENTE"
  const confirmado = item.status === "CONFIRMADO"
  const closed = CLOSED.includes(item.status)
  const host = isWebUrl(item.link) ? hostOf(item.link) : null
  const endsNextDay = validDate && end ? end.getDate() !== start.getDate() : false

  return (
    <article
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-2xl border transition-colors",
        pendente && "border-primary/30 bg-card shadow-xs",
        confirmado && "border-border bg-card",
        closed && "border-border bg-surface/60",
      )}>
      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        {validDate && <DateTile start={start} status={item.status} />}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "break-words text-base font-semibold leading-snug",
                  closed ? "text-muted-foreground" : "text-foreground",
                )}>
                {item.titulo}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {etapaLabel(item.etapa, undefined, item.etapaDescricao)}
              </p>
            </div>
            <span
              className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", STATUS_STYLES[item.status])}>
              {STATUS_AGENDAMENTO_LABELS[item.status]}
            </span>
          </div>

          {validDate && end && (<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums",
                closed ? "text-muted-foreground" : "text-foreground",
              )}>
              <Clock className="size-4 text-muted-foreground" aria-hidden />
              {fmtTime.format(start)}– {fmtTime.format(end)}
              <span className="font-normal text-muted-foreground">({item.duracaoMinutos}min{endsNextDay ? ", termina no dia seguinte" : ""})
                                                </span>
            </p>
            <p className="text-sm text-muted-foreground first-letter:capitalize">
              {fmtLongDate.format(start)}
              {!closed && <span className="text-primary">· {relativeLabel(start)}</span>}
            </p>
          </div>)}

          {item.mensagem && (<blockquote
            className="mt-4 whitespace-pre-line break-words border-l-2 border-primary/30 pl-3 text-sm leading-6 text-muted-foreground">
            {item.mensagem}
          </blockquote>)}

          {!closed && host && (<div className="mt-4 flex flex-wrap items-center gap-2">
            {confirmado ? (<>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Video className="size-4" aria-hidden />Entrar na reunião
                                                  </a>
              {validDate && (<a
                href={googleCalendarUrl(item, start)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost">
                <CalendarPlus className="size-4" aria-hidden />Adicionar à agenda
                                                    </a>)}
            </>) : (<a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-surface px-3 text-xs font-medium text-strong-foreground transition-colors hover:bg-muted">
              <Video className="size-3.5 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">Link da reunião</span>
              {host}
              <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden />
            </a>)}
          </div>)}
        </div>
      </div>

      {pendente && (<div
        className="flex flex-col gap-3 border-t border-border bg-surface/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-muted-foreground">A empresa aguarda sua resposta.</p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => onRespond(item, "recusar")}
            className="btn-secondary text-danger-foreground"
            disabled={busy || disabled}>
            {busy && responding === "recusar" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}Recusar
                                    </button>
          <button
            type="button"
            onClick={() => onRespond(item, "confirmar")}
            className="btn-primary"
            disabled={busy || disabled}>
            {busy && responding === "confirmar" ? (<LoaderCircle className="size-4 animate-spin" aria-hidden />) : (<Check className="size-4" aria-hidden />)}Confirmar presença
                                    </button>
        </div>
      </div>)}
    </article>
  )
}

function AgendamentosCandidato(
  {
    agendamentos,
  }: {
    agendamentos: CandidaturaAgendamento[]
  },
) {
  const confirmar = useConfirmarAgendamento()
  const recusar = useRecusarAgendamento()
  const [erro, setErro] = useState<string | null>(null)

  const [ativo, setAtivo] = useState<{
    id: string
    acao: "confirmar" | "recusar"
  } | null>(null)

  const pending = confirmar.isPending || recusar.isPending

  const {
    proximos,
    encerrados,
  } = useMemo(() => {
    const byDate = (a: CandidaturaAgendamento, b: CandidaturaAgendamento) => (Date.parse(a.inicio) || 0) - (Date.parse(b.inicio) || 0)
    const abertos = agendamentos.filter(item => !CLOSED.includes(item.status)).sort(byDate)
    const fechados = agendamentos.filter(item => CLOSED.includes(item.status)).sort((a, b) => byDate(b, a))

    return {
      proximos: abertos,
      encerrados: fechados,
    }
  }, [agendamentos])

  async function responder(agendamento: CandidaturaAgendamento, acao: "confirmar" | "recusar") {
    setErro(null)

    setAtivo({
      id: agendamento.id,
      acao,
    })

    try {
      const vars = {
        candidaturaId: agendamento.candidaturaId,
        agendamentoId: agendamento.id,
      }

      if (acao === "confirmar")
        await confirmar.mutateAsync(vars)
      else
        await recusar.mutateAsync(vars)
    } catch (requestError) {
      setErro(getErrorMessage(requestError, "Não foi possível atualizar o agendamento."))
    } finally {
      setAtivo(null)
    }
  }

  const renderCard = (item: CandidaturaAgendamento) => (<AgendamentoCard
    key={item.id}
    item={item}
    busy={pending && ativo?.id === item.id}
    disabled={pending}
    responding={ativo?.id === item.id ? ativo.acao : null}
    onRespond={(a, acao) => void responder(a, acao)} />)

  return (
    <section aria-labelledby="application-appointments-title" className={cn(cardBase, "p-5 sm:p-7")}>
      <SectionHeader
        id="application-appointments-title"
        icon={CalendarClock}
        title="Entrevistas e agendamentos"
        description="Convites e próximos encontros deste processo."
        aside={proximos.length > 0 && (<span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {proximos.length} {proximos.length === 1 ? "ativo" : "ativos"}
        </span>)} />

      {erro && (<p
        role="alert"
        className="mt-4 rounded-xl border border-danger/20 bg-danger-subtle px-4 py-3 text-sm text-danger-foreground">
        {erro}
      </p>)}

      {agendamentos.length === 0 ? (<EmptyHint icon={CalendarDays}>Ainda não há entrevistas ou reuniões agendadas. Quando a empresa enviar um convite, ele aparece aqui.
                        </EmptyHint>) : (<div className="mt-5 flex flex-col gap-3">
        {proximos.map(renderCard)}

        {encerrados.length > 0 && (<details className="group mt-1">
          <summary
            className="flex cursor-pointer list-none items-center gap-2 rounded-lg py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />Encerrados ({encerrados.length})
                                      </summary>
          <div className="mt-2 flex flex-col gap-3">{encerrados.map(renderCard)}</div>
        </details>)}
      </div>)}
    </section>
  )
}

function InscricaoRealizada(
  {
    createdAt,
    updatedAt,
    curriculoUrl,
    cartaApresentacao,
    etapaLabel,
    encerrada,
    onDesistir,
  }: {
    createdAt?: string | null
    updatedAt?: string | null
    curriculoUrl?: string | null
    cartaApresentacao?: string | null
    etapaLabel: string
    encerrada: boolean
    onDesistir: () => void
  },
) {
  const resume = resumeHref(curriculoUrl)

  return (
    <section aria-labelledby="application-documents-title" className={cn(cardBase, "p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="application-documents-title" className="scroll-mt-36 text-sm font-medium text-muted-foreground">Sua inscrição</h2>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
          <span className="size-1.5 rounded-full bg-success-foreground" aria-hidden />Enviada
                            </span>
      </div>

      <p className="mt-4 text-xl font-medium tracking-tight text-foreground">
        {createdAt ? <time dateTime={createdAt}>{formatDate(createdAt, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}</time> : "Recebida"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Data de envio da candidatura</p>

      <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-muted-foreground">Etapa atual</dt>
          <dd className="truncate font-medium text-foreground" title={etapaLabel}>{etapaLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-muted-foreground">Última atualização</dt>
          <dd className="font-medium text-foreground">{updatedAt ? formatDate(updatedAt, {
              day: "2-digit",
              month: "short",
            }) : "—"}</dd>
        </div>
      </dl>

      <h3 className="mt-6 text-sm font-medium text-muted-foreground">Documentos</h3>
      <ul className="mt-3 space-y-2">
        <li>
          {resume ? (<a
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-muted">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground"><FileText className="size-4" aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">Currículo</span>
              <span className="block text-xs text-muted-foreground">Abrir arquivo</span>
            </span>
            <ArrowUpRight
              className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden />
          </a>) : (<div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground"><FileText className="size-4" aria-hidden /></span>
            <p className="text-xs leading-5 text-muted-foreground">Nenhum currículo anexado.</p>
          </div>)}
        </li>
        {cartaApresentacao && (<li>
          <details className="group rounded-xl bg-surface">
            <summary
              className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground"><Mail className="size-4" aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">Carta de apresentação</span>
                <span className="block text-xs text-muted-foreground group-open:hidden">Ler carta</span>
                <span className="hidden text-xs text-muted-foreground group-open:block">Recolher</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="whitespace-pre-line break-words px-4 pb-4 pt-1 text-sm leading-7 text-muted-foreground">{cartaApresentacao}</p>
          </details>
        </li>)}
      </ul>

      {!encerrada && (<button
        type="button"
        onClick={onDesistir}
        className="mt-6 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-danger-foreground">
        <LogOut className="size-4" aria-hidden />Desistir do processo
                        </button>)}
    </section>
  )
}

function ApplicationFeedback(
  {
    feedback,
  }: {
    feedback: CandidaturaFeedback
  },
) {
  return (
    <article className="rounded-lg border border-border-subtle p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{etapaLabel(feedback.etapa, undefined, feedback.etapaDescricao)}</span>
        {feedback.createdAt && <time dateTime={feedback.createdAt} className="text-[11px] text-muted-foreground">{formatDate(feedback.createdAt, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}</time>}
      </div>
      <h3 className="mt-4 break-words text-sm font-semibold leading-6 tracking-tight">{feedback.titulo}</h3>
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{feedback.mensagem}</p>
      {(feedback.autorNome || typeof feedback.nota === "number") && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3"><p className="text-[11px] text-muted-foreground">{feedback.autorNome || "Equipe de recrutamento"}</p>{typeof feedback.nota === "number" && <NotaEstrelas nota={feedback.nota} />}</div>}
    </article>
  )
}

function SectionTabs({ items }: { items: { id: string; label: string; count?: number }[] }) {
  const [active, setActive] = useState(items[0].id)

  useEffect(() => {
    const targets = items.map(item => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el))
    if (!targets.length) return

    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: "-120px 0px -55% 0px" })

    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <nav
      aria-label="Seções da candidatura"
      className="sticky top-[var(--topbar-offset,76px)] z-10 mt-6 transition-[top] duration-300 ease-out flex gap-6 overflow-x-auto border-b border-border bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map(({ id, label, count }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "true" : undefined}
          onClick={() => setActive(id)}
          className={cn(
            "-mb-px inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-0.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
            active === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}>
          {label}
          {count !== undefined && <span className={cn("text-xs tabular-nums", active === id ? "text-primary" : "text-subtle-foreground")}>{count}</span>}
        </a>
      ))}
    </nav>
  )
}

export function ApplicationDetailScreen(
  {
    id,
  }: {
    id: string
  },
) {
  const {
    detalhe,
    loading,
    error,
    refetch,
  } = useCandidatura(id)

  const {
    vaga,
  } = useVaga(detalhe?.candidatura.vagaId ?? null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const desistirCandidatura = useDesistirCandidatura()
  const desistindo = desistirCandidatura.isPending

  if (loading)
    return <DetailSkeleton />

  if (error || !detalhe) return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <ErrorState
        title="Não encontramos esta candidatura"
        description={error ?? "A candidatura não está disponível para esta conta."}
        action={<div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => void refetch()} className="btn-secondary">Tentar novamente</button>
          <Link href={ROUTES.candidate.applications} className="btn-primary">Minhas candidaturas</Link>
        </div>} />
    </main>
  )

  const {
    candidatura,
    historico = [],
    feedbacks = [],
    agendamentos = [],
  } = detalhe

  const company = candidatura.nomeEmpresa || "Empresa confidencial"
  const encerrada = isFinalizada(candidatura.status)
  const etapas = etapasDaVaga(candidatura.etapasVaga)
  const currentIndex = etapas.indexOf(candidatura.etapaAtual)
  const currentLabel = etapaLabel(candidatura.etapaAtual, candidatura.etapasVaga, candidatura.etapaAtualDescricao)
  const progress = etapas.length > 0 && currentIndex >= 0 ? Math.round(((currentIndex + 1) / etapas.length) * 100) : 0
  const statusTitle = encerrada ? STATUS_LABELS[candidatura.status] : currentLabel
  const statusDescription = encerrada ? candidatura.motivoEncerramento || (candidatura.status === "APROVADA" ? "A empresa aprovou sua candidatura neste processo seletivo." : candidatura.status === "REPROVADA" ? "A empresa encerrou sua participação neste processo seletivo." : "Sua participação neste processo seletivo foi cancelada.") : candidatura.etapasVaga?.find(item => item.etapa === candidatura.etapaAtual)?.descricao || ETAPA_HINTS[candidatura.etapaAtual] || "Acompanhe as atualizações da empresa nesta página."
  const linhaDoTempo = montarLinhaDoTempo(historico, feedbacks, agendamentos, candidatura.etapasVaga)
  const diasNaEtapa = encerrada ? undefined : diasDesde(entradaNaEtapaAtual(historico, candidatura.etapaAtual))
  const feedbackList = [...feedbacks].sort((a, b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0))
  const pendingInvites = agendamentos.filter(item => item.status === "PENDENTE").length

  async function desistir() {
    if (desistindo)
      return

    setAcaoErro(null)

    try {
      await desistirCandidatura.mutateAsync(candidatura.id)
      setConfirmOpen(false)
    } catch (requestError) {
      setAcaoErro(getErrorMessage(requestError, "Não foi possível cancelar a candidatura."))
    }
  }

  return (
    <main className="application-detail scroll-smooth mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav
        className="mb-5 flex flex-wrap items-center justify-between gap-3"
        aria-label="Navegação da candidatura">
        <Link
          href={ROUTES.candidate.applications}
          className="group inline-flex min-h-10 items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />Minhas candidaturas
                            </Link>
        <button
          type="button"
          onClick={() => void refetch()}
          className="btn-secondary min-h-9 rounded-xl px-3 text-xs"
          disabled={desistindo}>
          <RefreshCw className="size-4" aria-hidden />Atualizar
                            </button>
      </nav>

      <header className={cn(cardBase, "overflow-hidden")}>
        <div className="flex flex-col justify-between gap-6 p-5 sm:p-7 xl:flex-row xl:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <CompanyLogo
              url={candidatura.logoUrlEmpresa || vaga?.logoUrlEmpresa}
              name={company}
              size="lg"
              className="size-14 rounded-lg sm:size-16" />
            <div className="min-w-0"><p className="text-xs leading-5 text-muted-foreground">{company}</p><h1
                className="mt-1.5 break-words text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-[28px]">{candidatura.vagaTitulo}</h1></div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full"><CandidaturaChatButton
              candidaturaId={candidatura.id}
              contatoNome={company}
              contatoImagemUrl={candidatura.logoUrlEmpresa || vaga?.logoUrlEmpresa}
              perspectiva="candidato"
              assunto={candidatura.vagaTitulo}
              className="min-h-10 rounded-lg px-4 text-xs" /><Link
              href={ROUTES.publicJob(candidatura.vagaId)}
              className="btn-secondary min-h-10 rounded-lg px-4 text-xs">Ver vaga<ArrowUpRight className="size-3.5" aria-hidden /></Link></div>
        </div>
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-subtle px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground">Situação</span><StatusBadge status={candidatura.status} size="sm" /></div>
          {candidatura.createdAt && <p className="text-xs text-muted-foreground">Inscrição em <time dateTime={candidatura.createdAt}>{formatDate(candidatura.createdAt, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}</time></p>}
          {currentIndex >= 0 && <p className="text-xs text-muted-foreground">Etapa {currentIndex + 1} de {etapas.length}</p>}
        </div>
      </header>
      <SectionTabs
        items={[
          { id: "application-status-title", label: "Acompanhamento" },
          { id: "application-appointments", label: "Agendamentos", count: agendamentos.length },
          { id: "application-feedback-title", label: "Feedbacks", count: feedbacks.length },
          { id: "application-history-title", label: "Histórico" },
          { id: "application-stages-title", label: "Etapas" },
        ]} />
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="application-status-title" className={cn(cardBase, "scroll-mt-36 p-5 sm:p-7")}>
            <div className="flex items-start gap-4">
                            <div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{encerrada ? "Resultado do processo" : "Sua etapa atual"}</p><h2
                  id="application-status-title"
                  className="mt-2 scroll-mt-36 break-words text-2xl font-semibold leading-tight tracking-tight">{statusTitle}</h2><p
                  className="mt-3 max-w-prose whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{statusDescription}</p></div>
            </div>
            {etapas.length > 0 && <div className="mt-6 border-t border-border-subtle pt-5"><div
                className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span>{encerrada ? "Etapa alcançada no processo" : "Seu caminho no processo"}</span><span>{currentIndex >= 0 ? `Etapa ${currentIndex + 1} de ${etapas.length}` : "Etapa em atualização"}</span></div><div
                role="progressbar"
                aria-label="Etapas alcançadas no processo seletivo"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-valuetext={`${currentLabel}${currentIndex >= 0 ? `, etapa ${currentIndex + 1} de ${etapas.length}` : ""}`}
                className="flex gap-1.5">{etapas.map((etapa, index) => <span
                  key={etapa}
                  title={etapaLabel(etapa, candidatura.etapasVaga)}
                  className={cn(
                    "h-1.5 min-w-0 flex-1 rounded-full",
                    index <= currentIndex ? candidatura.status === "APROVADA" ? "bg-success" : encerrada ? "bg-border-strong" : "bg-primary" : "bg-border-subtle",
                  )} />)}</div></div>}
            {diasNaEtapa !== undefined && <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Clock className="mt-1 size-3.5 shrink-0" aria-hidden /><span>{diasNaEtapa === 0 ? "Você entrou nesta etapa hoje." : `Você está nesta etapa ${descreverDias(diasNaEtapa)}.`}{diasNaEtapa >= DIAS_SEM_MOVIMENTACAO_ALERTA && " Ainda não houve novidades, mas você será notificado assim que a empresa movimentar o processo."}</span></p>}
            {candidatura.updatedAt && <p className="mt-4 text-xs text-muted-foreground">Última atualização em <time dateTime={candidatura.updatedAt}>{formatDate(candidatura.updatedAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}</time></p>}
          </section>
          {pendingInvites > 0 && <a
            href="#application-appointments"
            className="group flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-subtle px-4 py-3 text-sm font-medium text-warning-foreground">{pendingInvites === 1 ? "Você tem um convite aguardando resposta." : "Você tem " + pendingInvites + " convites aguardando resposta."}<ArrowUpRight
              className="ml-auto size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden /></a>}
          <div id="application-appointments" className="scroll-mt-36"><AgendamentosCandidato agendamentos={agendamentos} /></div>
          <section aria-labelledby="application-feedback-title" className={cn(cardBase, "p-5 sm:p-7")}>
            <SectionHeader
              id="application-feedback-title"
              icon={MessageSquare}
              title="Retornos da empresa"
              description="Feedbacks enviados pela equipe de recrutamento."
              aside={<span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">{feedbacks.length}</span>} />
            {feedbackList.length ? <div className="mt-5 space-y-4">{feedbackList.map(feedback => <ApplicationFeedback key={feedback.id} feedback={feedback} />)}</div> : <EmptyHint icon={MessageSquare}>A empresa ainda não enviou feedbacks. Quando houver um retorno, ele aparecerá aqui.</EmptyHint>}
          </section>
          <section aria-labelledby="application-history-title" className={cn(cardBase, "p-5 sm:p-7")}>
            <SectionHeader
              id="application-history-title"
              icon={History}
              title="Linha do tempo"
              description="Etapas, feedbacks e convites, do mais recente para o mais antigo." />
            <LinhaDoTempo eventos={linhaDoTempo} />
          </section>
        </div>
        <aside className="min-w-0 space-y-6">
          <section aria-labelledby="application-stages-title" className={cn(cardBase, "p-6")}>
            <h2 id="application-stages-title" className="scroll-mt-36 text-sm font-semibold tracking-tight">Etapas do processo</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{encerrada ? "A etapa alcançada permanece no histórico." : "Acompanhe seu momento no processo seletivo."}</p>
            <ol className="mt-6">{etapas.map((etapa, index) => {
                const active = index === currentIndex
                const previous = currentIndex >= 0 && index < currentIndex

                return (
                  <li key={etapa} aria-current={active ? "step" : undefined} className="flex gap-3"><div className="flex flex-col items-center"><span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-medium transition-colors",
                          active ? encerrada ? "border-border-strong bg-surface text-foreground" : "border-primary bg-primary text-primary-foreground" : previous ? "border-primary/30 bg-primary-subtle text-primary" : "border-border bg-card text-muted-foreground",
                        )}>{previous ? <Check className="size-3.5" aria-hidden /> : index + 1}</span>{index < etapas.length - 1 && <span className={cn("my-1 w-px flex-1", previous ? "bg-primary/40" : "bg-border")} aria-hidden />}</div><div className="min-w-0 pb-5 pt-1"><p
                        className={cn(
                          "text-xs leading-5",
                          active ? "font-medium text-foreground" : previous ? "font-medium text-strong-foreground" : "text-muted-foreground",
                        )}>{etapaLabel(etapa, candidatura.etapasVaga)}</p><p
                        className={cn("mt-0.5 text-[11px]", active && !encerrada ? "font-medium text-primary" : "text-muted-foreground")}>{active ? encerrada ? "Etapa alcançada" : "Você está aqui" : previous ? "Concluída" : encerrada ? "Não alcançada" : "A seguir"}</p></div></li>
                )
              })}</ol>
            {currentIndex < 0 && <p className="mt-3 text-xs text-muted-foreground">Etapa registrada: {currentLabel}.</p>}
          </section>
          <InscricaoRealizada
            createdAt={candidatura.createdAt}
            updatedAt={candidatura.updatedAt}
            curriculoUrl={candidatura.curriculoUrl}
            cartaApresentacao={candidatura.cartaApresentacao}
            etapaLabel={currentLabel}
            encerrada={encerrada}
            onDesistir={() => {
              setAcaoErro(null)
              setConfirmOpen(true)
            }} />
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!desistindo)
            setConfirmOpen(false)
        }}
        title="Desistir do processo"
        description="Sua candidatura será cancelada. O histórico continuará disponível."
        size="sm"
        footer={<>
          <button type="button" onClick={() => setConfirmOpen(false)} disabled={desistindo} className="btn-secondary">Continuar no processo</button>
          <button
            type="button"
            onClick={() => void desistir()}
            disabled={desistindo}
            className="btn-primary bg-danger hover:bg-danger">
            {desistindo && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {desistindo ? "Cancelando…" : "Confirmar desistência"}
          </button>
        </>}>
        <p className="text-sm leading-7 text-muted-foreground">Você se candidatou à vaga de <strong className="font-semibold text-foreground">{candidatura.vagaTitulo}</strong>{" "}na {company}. A desistência não pode ser desfeita.
                            </p>
        {acaoErro && <p role="alert" className="mt-4 rounded-lg bg-danger-subtle p-4 text-sm text-danger-foreground">{acaoErro}</p>}
      </Modal>
    </main>
  )
}
