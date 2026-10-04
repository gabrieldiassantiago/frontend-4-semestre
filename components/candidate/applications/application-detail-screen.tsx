"use client"
import { ROUTES } from "@/lib/config/routes"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CalendarClock, Check, Clock, ExternalLink, FileText, LoaderCircle, MessageSquare, RefreshCw, X } from "lucide-react"
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
import { ETAPA_HINTS, ETAPA_LABELS, STATUS_LABELS, STATUS_AGENDAMENTO_LABELS, etapasDaVaga, isFinalizada, type CandidaturaAgendamento } from "@/lib/types/candidatura.types"

function DetailSkeleton() {
  return <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8" aria-busy="true"><span className="sr-only">Carregando candidatura</span><Skeleton className="h-5 w-44" /><Skeleton className="mt-6 h-40 rounded-xl" /><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div></main>
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
    <section className="rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Entrevistas e agendamentos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Convites e próximos encontros deste processo.</p>
        </div>
        <CalendarClock className="size-5 text-primary" aria-hidden />
      </div>

      {erro && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{erro}</p>}

      {agendamentos.length === 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground">
          Ainda não há entrevistas ou reuniões agendadas.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {agendamentos.map((agendamento) => {
            const pendente = agendamento.status === "PENDENTE"
            const encerrado = agendamento.status === "CANCELADO" || agendamento.status === "RECUSADO"
            return (
              <article key={agendamento.id} className={cn("rounded-lg border p-5", pendente ? "border-[#ddd6fe] bg-[#faf8ff]" : "border-border/80 bg-card")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{agendamento.titulo}</h3>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", pendente && "bg-amber-50 text-amber-700", agendamento.status === "CONFIRMADO" && "bg-emerald-50 text-emerald-700", encerrado && "bg-muted text-muted-foreground", agendamento.status === "REALIZADO" && "bg-blue-50 text-blue-700", agendamento.status === "NAO_COMPARECEU" && "bg-red-50 text-red-700")}>
                        {STATUS_AGENDAMENTO_LABELS[agendamento.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-strong-foreground">
                      {formatDate(agendamento.inicio, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {agendamento.duracaoMinutos} min
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Etapa: {agendamento.etapaDescricao ?? ETAPA_LABELS[agendamento.etapa]}</p>
                    {agendamento.mensagem && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{agendamento.mensagem}</p>}
                  </div>

                  {!encerrado && isWebUrl(agendamento.link) && (
                    <a href={agendamento.link} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-strong-foreground shadow-xs transition-colors hover:bg-muted">
                      <ExternalLink className="size-3.5" aria-hidden />
                      Entrar na reunião
                    </a>
                  )}
                </div>

                {pendente && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-[#ddd6fe] pt-4 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => void responder(agendamento, "recusar")} className="btn-secondary text-red-700" disabled={pending}>
                      {recusar.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                      Recusar convite
                    </button>
                    <button type="button" onClick={() => void responder(agendamento, "confirmar")} className="btn-primary" disabled={pending}>
                      {confirmar.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                      Confirmar presença
                    </button>
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

export function ApplicationDetailScreen({ id }: { id: string }) {
  const { detalhe, loading, error, refetch } = useCandidatura(id)
  const { vaga } = useVaga(detalhe?.candidatura.vagaId ?? null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const desistirCandidatura = useDesistirCandidatura()
  const desistindo = desistirCandidatura.isPending

  if (loading) return <DetailSkeleton />
  if (error || !detalhe) return <main className="mx-auto max-w-lg px-4 py-20"><ErrorState title="Não encontramos esta candidatura" description={error ?? "A candidatura não está disponível para esta conta."} action={<div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => void refetch()} className="btn-secondary">Tentar novamente</button><Link href={ROUTES.candidate.applications} className="btn-primary">Minhas candidaturas</Link></div>} /></main>

  const { candidatura, historico = [], feedbacks = [], agendamentos = [] } = detalhe
  const company = candidatura.nomeEmpresa || "Empresa confidencial"
  const encerrada = isFinalizada(candidatura.status)
  const etapas = etapasDaVaga(candidatura.etapasVaga)
  const currentIndex = etapas.indexOf(candidatura.etapaAtual)
  const currentLabel = ETAPA_LABELS[candidatura.etapaAtual] || candidatura.etapaAtual
  const statusTone = candidatura.status === "APROVADA" ? "border-success-border bg-success-subtle text-success-foreground" : candidatura.status === "REPROVADA" ? "border-danger/20 bg-danger-subtle text-danger-foreground" : candidatura.status === "CANCELADA" ? "border-border bg-surface text-muted-foreground" : "border-primary/20 bg-primary-subtle text-primary"
  const StatusIcon = candidatura.status === "APROVADA" ? Check : candidatura.status === "REPROVADA" || candidatura.status === "CANCELADA" ? X : Clock
  const statusTitle = encerrada ? STATUS_LABELS[candidatura.status] : currentLabel
  const statusDescription = encerrada
    ? candidatura.motivoEncerramento || (candidatura.status === "APROVADA" ? "A empresa aprovou sua candidatura neste processo seletivo." : candidatura.status === "REPROVADA" ? "A empresa encerrou sua participação neste processo seletivo." : "Sua participação neste processo seletivo foi cancelada.")
    : candidatura.etapaAtualDescricao || ETAPA_HINTS[candidatura.etapaAtual] || "Acompanhe as atualizações da empresa nesta página."
  const history = [...historico].sort((a,b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0))
  const feedbackList = [...feedbacks].sort((a,b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0))
  const pendingInvites = agendamentos.filter(item => item.status === "PENDENTE").length

  async function desistir() {
    if (desistindo) return
    setAcaoErro(null)
    try { await desistirCandidatura.mutateAsync(candidatura.id); setConfirmOpen(false) }
    catch (requestError) { setAcaoErro(getErrorMessage(requestError, "Não foi possível cancelar a candidatura.")) }
  }

  return (
    <main className="application-detail mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-8 lg:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={ROUTES.candidate.applications} className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden />Minhas candidaturas</Link>
        <button type="button" onClick={() => void refetch()} className="btn-ghost" disabled={desistindo}><RefreshCw className="size-4" aria-hidden />Atualizar</button>
      </div>
      <header className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4"><CompanyLogo url={vaga?.logoUrlEmpresa} name={company} size="lg" /><div className="min-w-0"><p className="text-sm text-muted-foreground">{company}</p><h1 className="mt-1 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{candidatura.vagaTitulo}</h1>{candidatura.createdAt && <p className="mt-3 text-xs text-muted-foreground">Candidatura enviada em {formatDate(candidatura.createdAt)}</p>}</div></div>
          <Link href={"/vaga/" + candidatura.vagaId} className="btn-secondary self-start shrink-0">Ver vaga<ArrowUpRight className="size-4" aria-hidden /></Link>
        </div>
      </header>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="application-status-title" className={cn("rounded-xl border p-6 sm:p-7",statusTone)}>
            <div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg border border-current/15 bg-card/60"><StatusIcon className="size-5" aria-hidden /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-medium">{encerrada ? "Resultado do processo" : "Etapa atual"}</p><StatusBadge status={candidatura.status} size="sm" /></div><h2 id="application-status-title" className="mt-2 text-xl font-semibold tracking-tight">{statusTitle}</h2><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-strong-foreground">{statusDescription}</p>{candidatura.updatedAt && <p className="mt-4 text-xs text-muted-foreground">Última atualização em {formatDate(candidatura.updatedAt)}</p>}</div></div>
          </section>
          {pendingInvites > 0 && <a href="#application-appointments" className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning-subtle p-4 text-sm font-medium text-warning-foreground"><CalendarClock className="size-5 shrink-0" aria-hidden />{pendingInvites === 1 ? "Você tem um convite aguardando resposta." : "Você tem " + pendingInvites + " convites aguardando resposta."}<ArrowUpRight className="ml-auto size-4 shrink-0" aria-hidden /></a>}
          <div id="application-appointments" className="scroll-mt-24"><AgendamentosCandidato agendamentos={agendamentos} /></div>
          <section aria-labelledby="application-feedback-title" className="rounded-xl border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3"><h2 id="application-feedback-title" className="text-lg font-semibold tracking-tight">Retornos da empresa</h2><span className="text-xs text-muted-foreground">{feedbacks.length} {feedbacks.length === 1 ? "feedback" : "feedbacks"}</span></div>
            {feedbackList.length ? <div className="mt-5 space-y-4">{feedbackList.map(feedback => <FeedbackCard key={feedback.id} feedback={feedback} />)}</div> : <div className="mt-5 flex items-start gap-3 rounded-lg bg-surface p-4 text-sm leading-6 text-muted-foreground"><MessageSquare className="mt-0.5 size-4 shrink-0" aria-hidden /><p>A empresa ainda não enviou feedbacks. Quando houver um retorno, ele aparecerá aqui.</p></div>}
          </section>
          <section aria-labelledby="application-history-title" className="rounded-xl border border-border bg-card p-6 sm:p-7">
            <h2 id="application-history-title" className="text-lg font-semibold tracking-tight">Histórico da candidatura</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">Atualizações registradas durante o processo, da mais recente para a mais antiga.</p>
            {history.length ? <ol className="mt-6 space-y-0">{history.map((item,index) => <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
              {index < history.length-1 && <span aria-hidden className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />}
              <span aria-hidden className={cn("relative mt-1 size-4 shrink-0 rounded-full border-4",index===0?"border-primary-subtle bg-primary":"border-surface bg-border-strong")} />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{item.statusAnterior && item.statusAnterior!==item.statusNovo ? STATUS_LABELS[item.statusNovo] : ETAPA_LABELS[item.etapaNova] || "Atualização"}</h3>{!(item.statusAnterior && item.statusAnterior!==item.statusNovo) && <span className="text-xs text-muted-foreground">{STATUS_LABELS[item.statusNovo]}</span>}</div>{item.observacao && <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{item.observacao}</p>}{item.createdAt && <time dateTime={item.createdAt} className="mt-2 block text-xs text-muted-foreground">{formatDate(item.createdAt,{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</time>}</div>
            </li>)}</ol> : <p className="mt-5 text-sm leading-6 text-muted-foreground">Ainda não há movimentações registradas no histórico.</p>}
          </section>
        </div>
        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
          <section aria-labelledby="application-stages-title" className="rounded-xl border border-border bg-card p-6">
            <h2 id="application-stages-title" className="text-base font-semibold tracking-tight">Etapas do processo</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">{encerrada ? "A etapa alcançada permanece no histórico." : "Acompanhe seu momento no processo seletivo."}</p>
            <ol className="mt-6">{etapas.map((etapa,index) => {
              const active = index === currentIndex
              const previous = currentIndex >= 0 && index < currentIndex
              return <li key={etapa} aria-current={active ? "step" : undefined} className="flex gap-3">
                <div className="flex flex-col items-center"><span className={cn("grid size-8 shrink-0 place-items-center rounded-lg border text-xs font-medium",active ? encerrada ? "border-border-strong bg-surface text-foreground" : "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>{index+1}</span>{index<etapas.length-1 && <span className="w-px flex-1 bg-border" aria-hidden />}</div>
                <div className="min-w-0 pb-5"><p className={cn("text-sm",active?"font-semibold text-foreground":"text-muted-foreground")}>{ETAPA_LABELS[etapa]}</p><p className="mt-1 text-[11px] text-muted-foreground">{active ? encerrada ? "Etapa alcançada" : "Você está aqui" : previous ? "Etapa anterior" : encerrada ? "Não alcançada" : "A seguir"}</p></div>
              </li>
            })}</ol>
            {currentIndex<0 && <p className="mt-3 text-xs text-muted-foreground">Etapa registrada: {currentLabel}.</p>}
          </section>
          <section aria-labelledby="application-documents-title" className="rounded-xl border border-border bg-card p-6"><h2 id="application-documents-title" className="text-base font-semibold tracking-tight">Sua candidatura</h2>
            {candidatura.curriculoUrl && isWebUrl(candidatura.curriculoUrl) ? <a href={candidatura.curriculoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 w-full"><FileText className="size-4" aria-hidden />Currículo enviado<ExternalLink className="size-3.5" aria-hidden /></a> : <p className="mt-3 text-xs leading-6 text-muted-foreground">Nenhum currículo anexado a esta candidatura.</p>}
            {candidatura.cartaApresentacao && <details className="mt-4 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-medium">Carta de apresentação</summary><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">{candidatura.cartaApresentacao}</p></details>}
            {!encerrada && <div className="mt-5 border-t border-border pt-4"><button type="button" onClick={() => {setAcaoErro(null);setConfirmOpen(true)}} className="min-h-11 text-sm font-medium text-danger-foreground hover:underline">Desistir do processo</button></div>}
          </section>
        </aside>
      </div>
      <Modal open={confirmOpen} onClose={() => {if(!desistindo) setConfirmOpen(false)}} title="Desistir do processo" description="Sua candidatura será cancelada. O histórico continuará disponível." size="sm" footer={<><button type="button" onClick={()=>setConfirmOpen(false)} disabled={desistindo} className="btn-secondary">Continuar no processo</button><button type="button" onClick={()=>void desistir()} disabled={desistindo} className="btn-primary bg-danger hover:bg-danger">{desistindo && <LoaderCircle className="size-4 animate-spin" aria-hidden />}{desistindo?"Cancelando…":"Confirmar desistência"}</button></>}>
        <p className="text-sm leading-7 text-muted-foreground">Você está se candidatando à vaga de <strong className="font-semibold text-foreground">{candidatura.vagaTitulo}</strong> na {company}. A desistência não pode ser desfeita.</p>
        {acaoErro && <p role="alert" className="mt-4 rounded-lg bg-danger-subtle p-4 text-sm text-danger-foreground">{acaoErro}</p>}
      </Modal>
    </main>
  )
}
