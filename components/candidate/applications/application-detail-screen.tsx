"use client"
import { ROUTES } from "@/lib/config/routes"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  FileText,
  History,
  LoaderCircle,
  LogOut,
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
import { FeedbackCard, StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { CandidaturaChatButton } from "@/components/shared/chat/candidatura-chat"
import { ETAPA_HINTS, ETAPA_LABELS, STATUS_LABELS, STATUS_AGENDAMENTO_LABELS, etapasDaVaga, isFinalizada, type CandidaturaAgendamento } from "@/lib/types/candidatura.types"

const cardBase = "rounded-2xl border border-border bg-card shadow-xs"

function SectionHeader({ id, icon: Icon, title, description, aside }: { id?: string; icon: typeof Clock; title: string; description?: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>}
        </div>
      </div>
      {aside}
    </div>
  )
}

function EmptyHint({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
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

function AgendamentosCandidato({ agendamentos }: { agendamentos: CandidaturaAgendamento[] }) {
  const confirmar = useConfirmarAgendamento()
  const recusar = useRecusarAgendamento()
  const [erro, setErro] = useState<string | null>(null)
  const pending = confirmar.isPending || recusar.isPending

  async function responder(agendamento: CandidaturaAgendamento, acao: "confirmar" | "recusar") {
    setErro(null)
    try {
      if (acao === "confirmar") {
        await confirmar.mutateAsync({ candidaturaId: agendamento.candidaturaId, agendamentoId: agendamento.id })
      } else {
        await recusar.mutateAsync({ candidaturaId: agendamento.candidaturaId, agendamentoId: agendamento.id })
      }
    } catch (requestError) {
      setErro(getErrorMessage(requestError, "Não foi possível atualizar o agendamento."))
    }
  }

  return (
    <section aria-labelledby="application-appointments-title" className={cn(cardBase, "p-6 sm:p-7")}>
      <SectionHeader
        id="application-appointments-title"
        icon={CalendarClock}
        title="Entrevistas e agendamentos"
        description="Convites e próximos encontros deste processo."
        aside={agendamentos.length > 0 && <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">{agendamentos.length}</span>}
      />

      {erro && <p className="mt-4 rounded-xl border border-danger/20 bg-danger-subtle px-4 py-3 text-sm text-danger-foreground" role="alert">{erro}</p>}

      {agendamentos.length === 0 ? (
        <EmptyHint icon={CalendarDays}>Ainda não há entrevistas ou reuniões agendadas.</EmptyHint>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {agendamentos.map((agendamento) => {
            const pendente = agendamento.status === "PENDENTE"
            const encerrado = agendamento.status === "CANCELADO" || agendamento.status === "RECUSADO"
            const inicio = new Date(agendamento.inicio)
            const validDate = !Number.isNaN(inicio.getTime())
            return (
              <article
                key={agendamento.id}
                className={cn(
                  "overflow-hidden rounded-xl border transition-colors",
                  pendente ? "border-primary/25 bg-primary-subtle/40" : "border-border bg-card",
                  encerrado && "opacity-75",
                )}
              >
                <div className="flex gap-4 p-4 sm:p-5">
                  {validDate && (
                    <div className={cn("flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border py-2 text-center", pendente ? "border-primary/20 bg-card text-primary" : "border-border bg-surface text-foreground")} aria-hidden>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{formatDate(agendamento.inicio, { month: "short" }).replace(".", "")}</span>
                      <span className="text-xl font-semibold leading-none">{inicio.getDate()}</span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{agendamento.titulo}</h3>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            pendente && "border-warning/25 bg-warning-subtle text-warning-foreground",
                            agendamento.status === "CONFIRMADO" && "border-success-border bg-success-subtle text-success-foreground",
                            encerrado && "border-border bg-surface text-muted-foreground",
                            agendamento.status === "REALIZADO" && "border-primary/20 bg-primary-subtle text-primary",
                            agendamento.status === "NAO_COMPARECEU" && "border-danger/20 bg-danger-subtle text-danger-foreground",
                          )}
                        >
                          {STATUS_AGENDAMENTO_LABELS[agendamento.status]}
                        </span>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-strong-foreground">
                        <Clock className="size-3.5 text-muted-foreground" aria-hidden />
                        {formatDate(agendamento.inicio, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                        <span className="text-muted-foreground">· {agendamento.duracaoMinutos} min</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Etapa: {agendamento.etapaDescricao ?? ETAPA_LABELS[agendamento.etapa]}</p>
                      {agendamento.mensagem && <p className="mt-3 whitespace-pre-line rounded-lg bg-surface p-3 text-sm leading-relaxed text-muted-foreground">{agendamento.mensagem}</p>}
                    </div>

                    {!encerrado && isWebUrl(agendamento.link) && (
                      <a href={agendamento.link} target="_blank" rel="noopener noreferrer" className="btn-secondary shrink-0 self-start">
                        <Video className="size-4" aria-hidden />
                        Entrar na reunião
                      </a>
                    )}
                  </div>
                </div>

                {pendente && (
                  <div className="flex flex-col gap-2 border-t border-primary/15 bg-card/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-xs font-medium text-muted-foreground">A empresa aguarda sua resposta.</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={() => void responder(agendamento, "recusar")} className="btn-secondary text-danger-foreground" disabled={pending}>
                        {recusar.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                        Recusar
                      </button>
                      <button type="button" onClick={() => void responder(agendamento, "confirmar")} className="btn-primary" disabled={pending}>
                        {confirmar.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
                        Confirmar presença
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function InscricaoRealizada({
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
}) {
  const hasCurriculo = !!curriculoUrl && isWebUrl(curriculoUrl)

  return (
    <section aria-labelledby="application-documents-title" className={cn(cardBase, "p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="application-documents-title" className="text-sm font-medium text-muted-foreground">Sua inscrição</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
          <span className="size-1.5 rounded-full bg-success-foreground" aria-hidden />
          Enviada
        </span>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {createdAt ? <time dateTime={createdAt}>{formatDate(createdAt, { day: "numeric", month: "short", year: "numeric" })}</time> : "Recebida"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Data de envio da candidatura</p>

      <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-muted-foreground">Etapa atual</dt>
          <dd className="truncate font-medium text-foreground" title={etapaLabel}>{etapaLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-muted-foreground">Última atualização</dt>
          <dd className="font-medium text-foreground">{updatedAt ? formatDate(updatedAt, { day: "2-digit", month: "short" }) : "—"}</dd>
        </div>
      </dl>

      <h3 className="mt-6 text-sm font-medium text-muted-foreground">Documentos</h3>
      <ul className="mt-3 space-y-2">
        <li>
          {hasCurriculo ? (
            <a
              href={curriculoUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-muted"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground"><FileText className="size-4" aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">Currículo</span>
                <span className="block text-xs text-muted-foreground">Abrir arquivo</span>
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground"><FileText className="size-4" aria-hidden /></span>
              <p className="text-xs leading-5 text-muted-foreground">Nenhum currículo anexado.</p>
            </div>
          )}
        </li>
        {cartaApresentacao && (
          <li>
            <details className="group rounded-xl bg-surface">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground"><Mail className="size-4" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">Carta de apresentação</span>
                  <span className="block text-xs text-muted-foreground group-open:hidden">Ler carta</span>
                  <span className="hidden text-xs text-muted-foreground group-open:block">Recolher</span>
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="whitespace-pre-line break-words px-4 pb-4 pt-1 text-sm leading-7 text-muted-foreground">{cartaApresentacao}</p>
            </details>
          </li>
        )}
      </ul>

      {!encerrada && (
        <button
          type="button"
          onClick={onDesistir}
          className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-danger-foreground"
        >
          <LogOut className="size-4" aria-hidden />
          Desistir do processo
        </button>
      )}
    </section>
  )
}

export function ApplicationDetailScreen({ id }: { id: string }) {
  const { detalhe, loading, error, refetch } = useCandidatura(id)
  const { vaga } = useVaga(detalhe?.candidatura.vagaId ?? null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const desistirCandidatura = useDesistirCandidatura()
  const desistindo = desistirCandidatura.isPending

  if (loading) return <DetailSkeleton />
  if (error || !detalhe)
    return (
      <main className="mx-auto max-w-lg px-4 py-20">
        <ErrorState
          title="Não encontramos esta candidatura"
          description={error ?? "A candidatura não está disponível para esta conta."}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => void refetch()} className="btn-secondary">Tentar novamente</button>
              <Link href={ROUTES.candidate.applications} className="btn-primary">Minhas candidaturas</Link>
            </div>
          }
        />
      </main>
    )

  const { candidatura, historico = [], feedbacks = [], agendamentos = [] } = detalhe
  const company = candidatura.nomeEmpresa || "Empresa confidencial"
  const encerrada = isFinalizada(candidatura.status)
  const etapas = etapasDaVaga(candidatura.etapasVaga)
  const currentIndex = etapas.indexOf(candidatura.etapaAtual)
  const currentLabel = ETAPA_LABELS[candidatura.etapaAtual] || candidatura.etapaAtual
  const progress = etapas.length > 0 && currentIndex >= 0 ? Math.round(((currentIndex + 1) / etapas.length) * 100) : 0
  const statusDot =
  candidatura.status === "APROVADA"
  ? "bg-success-foreground"
  : candidatura.status === "REPROVADA"
  ? "bg-danger-foreground"
  : candidatura.status === "CANCELADA"
  ? "bg-muted-foreground"
  : "bg-primary"
  const StatusIcon = candidatura.status === "APROVADA" ? Check : candidatura.status === "REPROVADA" || candidatura.status === "CANCELADA" ? X : Clock
  const statusTitle = encerrada ? STATUS_LABELS[candidatura.status] : currentLabel
  const statusDescription = encerrada
    ? candidatura.motivoEncerramento ||
      (candidatura.status === "APROVADA"
        ? "A empresa aprovou sua candidatura neste processo seletivo."
        : candidatura.status === "REPROVADA"
          ? "A empresa encerrou sua participação neste processo seletivo."
          : "Sua participação neste processo seletivo foi cancelada.")
    : candidatura.etapaAtualDescricao || ETAPA_HINTS[candidatura.etapaAtual] || "Acompanhe as atualizações da empresa nesta página."
  const history = [...historico].sort((a, b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0))
  const feedbackList = [...feedbacks].sort((a, b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0))
  const pendingInvites = agendamentos.filter((item) => item.status === "PENDENTE").length

  async function desistir() {
    if (desistindo) return
    setAcaoErro(null)
    try {
      await desistirCandidatura.mutateAsync(candidatura.id)
      setConfirmOpen(false)
    } catch (requestError) {
      setAcaoErro(getErrorMessage(requestError, "Não foi possível cancelar a candidatura."))
    }
  }

  return (
    <main className="application-detail mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-8 lg:py-10">
      <nav className="mb-5 flex flex-wrap items-center justify-between gap-3" aria-label="Navegação da candidatura">
        <Link href={ROUTES.candidate.applications} className="group inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Minhas candidaturas
        </Link>
        <button type="button" onClick={() => void refetch()} className="btn-ghost" disabled={desistindo}>
          <RefreshCw className="size-4" aria-hidden />
          Atualizar
        </button>
      </nav>

      <header className={cardBase}>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="rounded-2xl bg-card p-1 shadow-xs ring-1 ring-border">
                <CompanyLogo url={vaga?.logoUrlEmpresa} name={company} size="lg" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{company}</p>
                <h1 className="mt-1 text-balance break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{candidatura.vagaTitulo}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={candidatura.status} size="sm" />
                  {candidatura.createdAt && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden />
                      Inscrito em {formatDate(candidatura.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 self-start">
              <CandidaturaChatButton candidaturaId={candidatura.id} contatoNome={company} contatoImagemUrl={candidatura.logoUrlEmpresa} perspectiva="candidato" assunto={candidatura.vagaTitulo} />
              <Link href={"/vaga/" + candidatura.vagaId} className="btn-secondary shrink-0">
                Ver vaga
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          {etapas.length > 0 && (
            <div className="mt-7 border-t border-border pt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-strong-foreground">
                  {encerrada ? "Etapa alcançada" : "Progresso"}: <span className="text-foreground">{currentLabel}</span>
                </span>
                {currentIndex >= 0 && <span className="text-muted-foreground">Etapa {currentIndex + 1} de {etapas.length}</span>}
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progresso no processo seletivo">
                <div className={cn("h-full rounded-full transition-[width] duration-500", encerrada && candidatura.status !== "APROVADA" ? "bg-border-strong" : candidatura.status === "APROVADA" ? "bg-success-foreground" : "bg-primary")} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
  <section aria-labelledby="application-status-title" className={cn(cardBase, "p-6 sm:p-7")}>
  <div className="flex items-center justify-between gap-4">
  <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
  <span className="relative flex size-2" aria-hidden>
  {!encerrada && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", statusDot)} />}
  <span className={cn("relative inline-flex size-2 rounded-full", statusDot)} />
  </span>
  {encerrada ? "Resultado do processo" : "Etapa atual"}
  </p>
  {candidatura.updatedAt && (
  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
  <StatusIcon className="size-3.5" aria-hidden />
  <span>Atualizado em <time dateTime={candidatura.updatedAt}>{formatDate(candidatura.updatedAt, { day: "2-digit", month: "short" })}</time></span>
  </p>
  )}
  </div>
  <h2 id="application-status-title" className="mt-4 text-3xl font-semibold tracking-tight text-foreground text-balance">{statusTitle}</h2>
  <p className="mt-3 max-w-prose whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{statusDescription}</p>
  </section>

          {pendingInvites > 0 && (
            <a href="#application-appointments" className="group flex items-center gap-3 rounded-2xl border border-warning/25 bg-warning-subtle p-4 text-sm font-medium text-warning-foreground transition-shadow hover:shadow-sm">
              <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-card">
                <CalendarClock className="size-4" aria-hidden />
                <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse rounded-full bg-warning" aria-hidden />
              </span>
              {pendingInvites === 1 ? "Você tem um convite aguardando resposta." : "Você tem " + pendingInvites + " convites aguardando resposta."}
              <ArrowUpRight className="ml-auto size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          )}

          <div id="application-appointments" className="scroll-mt-24">
            <AgendamentosCandidato agendamentos={agendamentos} />
          </div>

          <section aria-labelledby="application-feedback-title" className={cn(cardBase, "p-6 sm:p-7")}>
            <SectionHeader
              id="application-feedback-title"
              icon={MessageSquare}
              title="Retornos da empresa"
              description="Feedbacks enviados pela equipe de recrutamento."
              aside={<span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">{feedbacks.length}</span>}
            />
            {feedbackList.length ? (
              <div className="mt-5 space-y-4">{feedbackList.map((feedback) => <FeedbackCard key={feedback.id} feedback={feedback} />)}</div>
            ) : (
              <EmptyHint icon={MessageSquare}>A empresa ainda não enviou feedbacks. Quando houver um retorno, ele aparecerá aqui.</EmptyHint>
            )}
          </section>

          <section aria-labelledby="application-history-title" className={cn(cardBase, "p-6 sm:p-7")}>
            <SectionHeader id="application-history-title" icon={History} title="Histórico da candidatura" description="Da atualização mais recente para a mais antiga." />
            {history.length ? (
              <ol className="mt-6">
                {history.map((item, index) => {
                  const statusChanged = item.statusAnterior && item.statusAnterior !== item.statusNovo
                  return (
                    <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < history.length - 1 && <span aria-hidden className="absolute bottom-0 left-[9px] top-6 w-px bg-border" />}
                      <span aria-hidden className={cn("relative mt-1 size-5 shrink-0 rounded-full border-4", index === 0 ? "border-primary-subtle bg-primary" : "border-surface bg-border-strong")} />
                      <div className={cn("min-w-0 flex-1 rounded-xl p-3 -mt-2", index === 0 && "bg-surface")}>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">{statusChanged ? STATUS_LABELS[item.statusNovo] : ETAPA_LABELS[item.etapaNova] || "Atualização"}</h3>
                          {!statusChanged && <span className="rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border">{STATUS_LABELS[item.statusNovo]}</span>}
                          {index === 0 && <span className="text-[11px] font-semibold text-primary">Mais recente</span>}
                        </div>
                        {item.observacao && <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{item.observacao}</p>}
                        {item.createdAt && (
                          <time dateTime={item.createdAt} className="mt-2 block text-xs text-muted-foreground">
                            {formatDate(item.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </time>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <EmptyHint icon={History}>Ainda não há movimentações registradas no histórico.</EmptyHint>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
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
            }}
          />

          <section aria-labelledby="application-stages-title" className={cn(cardBase, "p-6")}>
            <h2 id="application-stages-title" className="text-base font-semibold tracking-tight">Etapas do processo</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{encerrada ? "A etapa alcançada permanece no histórico." : "Acompanhe seu momento no processo seletivo."}</p>
            <ol className="mt-6">
              {etapas.map((etapa, index) => {
                const active = index === currentIndex
                const previous = currentIndex >= 0 && index < currentIndex
                return (
                  <li key={etapa} aria-current={active ? "step" : undefined} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                          active
                            ? encerrada
                              ? "border-border-strong bg-surface text-foreground"
                              : "border-primary bg-primary text-primary-foreground ring-4 ring-primary-subtle"
                            : previous
                              ? "border-primary/30 bg-primary-subtle text-primary"
                              : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {previous ? <Check className="size-3.5" aria-hidden /> : index + 1}
                      </span>
                      {index < etapas.length - 1 && <span className={cn("my-1 w-px flex-1", previous ? "bg-primary/40" : "bg-border")} aria-hidden />}
                    </div>
                    <div className="min-w-0 pb-5 pt-1">
                      <p className={cn("text-sm", active ? "font-semibold text-foreground" : previous ? "font-medium text-strong-foreground" : "text-muted-foreground")}>{ETAPA_LABELS[etapa]}</p>
                      <p className={cn("mt-0.5 text-[11px]", active && !encerrada ? "font-medium text-primary" : "text-muted-foreground")}>
                        {active ? (encerrada ? "Etapa alcançada" : "Você está aqui") : previous ? "Concluída" : encerrada ? "Não alcançada" : "A seguir"}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
            {currentIndex < 0 && <p className="mt-3 text-xs text-muted-foreground">Etapa registrada: {currentLabel}.</p>}
          </section>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!desistindo) setConfirmOpen(false)
        }}
        title="Desistir do processo"
        description="Sua candidatura será cancelada. O histórico continuará disponível."
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setConfirmOpen(false)} disabled={desistindo} className="btn-secondary">Continuar no processo</button>
            <button type="button" onClick={() => void desistir()} disabled={desistindo} className="btn-primary bg-danger hover:bg-danger">
              {desistindo && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {desistindo ? "Cancelando…" : "Confirmar desistência"}
            </button>
          </>
        }
      >
        <p className="text-sm leading-7 text-muted-foreground">
          Você está se candidatando à vaga de <strong className="font-semibold text-foreground">{candidatura.vagaTitulo}</strong> na {company}. A desistência não pode ser desfeita.
        </p>
        {acaoErro && <p role="alert" className="mt-4 rounded-lg bg-danger-subtle p-4 text-sm text-danger-foreground">{acaoErro}</p>}
      </Modal>
    </main>
  )
}