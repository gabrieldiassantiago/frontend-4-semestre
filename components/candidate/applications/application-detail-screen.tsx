"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  CircleAlert,
  ExternalLink,
  FileText,
  LoaderCircle,
  MessageSquareQuote,
  RefreshCw,
  History,
} from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { Alert, EmptyState, ErrorState, Skeleton } from "@/components/ui/states"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Modal } from "@/components/ui/modal"
import {
  EtapaTrilha,
  FeedbackCard,
  HistoricoTimeline,
  StatusBadge,
} from "@/components/candidatura/candidatura-ui"
import { useCandidatura, revalidarCandidatura } from "@/lib/hooks/useCandidaturas"
import { desistirCandidatura } from "@/lib/services/candidatura.service"
import { getErrorMessage } from "@/lib/errors"
import { formatDate } from "@/lib/format"
import {
  ETAPA_LABELS,
  isFinalizada,
  type EtapaProcesso,
} from "@/lib/types/candidatura.types"

function DetailSkeleton() {
  return (
    <PageShell className="max-w-[1080px]" aria-busy="true">
      <span className="sr-only">Carregando candidatura</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-24 rounded-card" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-[520px] rounded-card" />
        <Skeleton className="h-80 rounded-card" />
      </div>
    </PageShell>
  )
}

export function ApplicationDetailScreen({ id }: { id: string }) {
  const { detalhe, loading, error, refetch } = useCandidatura(id)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [desistindo, setDesistindo] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)

  if (loading) return <DetailSkeleton />

  if (error || !detalhe) {
    return (
      <PageShell className="max-w-lg py-20">
        <ErrorState
          title="Não encontramos esta candidatura"
          description={error ?? "Ela pode ter sido removida ou não pertence à sua conta."}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button type="button" onClick={() => void refetch()} className="btn-secondary">
                <RefreshCw className="size-4" aria-hidden />
                Tentar novamente
              </button>
              <Link href="/candidaturas" className="btn-primary">
                Ver minhas candidaturas
              </Link>
            </div>
          }
        />
      </PageShell>
    )
  }

  const { candidatura, historico, feedbacks } = detalhe
  const company = candidatura.nomeEmpresa ?? "Empresa confidencial"
  const encerrada = isFinalizada(candidatura.status)

  const desistir = async () => {
    setDesistindo(true)
    setAcaoErro(null)
    try {
      await desistirCandidatura(candidatura.id)
      await revalidarCandidatura(candidatura.id)
      setConfirmOpen(false)
    } catch (requestError) {
      setAcaoErro(getErrorMessage(requestError, "Não foi possível cancelar a candidatura."))
    } finally {
      setDesistindo(false)
    }
  }

  // Agrupa por etapa para o candidato ler o retorno na ordem do funil.
  const feedbacksPorEtapa = feedbacks.reduce<Record<string, typeof feedbacks>>((acc, feedback) => {
    acc[feedback.etapa] = [...(acc[feedback.etapa] ?? []), feedback]
    return acc
  }, {})

  return (
    <PageShell className="max-w-[1080px]">
      <Link
        href="/candidaturas"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Candidaturas
      </Link>

      <header className="mt-5 flex flex-col gap-5 rounded-panel border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <EntityAvatar name={company} size="lg" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted-foreground">{company}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground text-balance sm:text-2xl">
            {candidatura.vagaTitulo}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={candidatura.status} />
            <span className="text-xs font-semibold text-muted-foreground">
              Etapa atual: {ETAPA_LABELS[candidatura.etapaAtual]}
            </span>
          </div>
        </div>

        {candidatura.vagaId && (
          <Link href={`/vaga/${candidatura.vagaId}`} className="btn-secondary shrink-0">
            Ver a vaga
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        )}
      </header>

      {encerrada && candidatura.motivoEncerramento && (
        <div className="mt-5">
          <Alert tone={candidatura.status === "APROVADA" ? "success" : "danger"}>
            <strong className="font-bold">
              {candidatura.status === "APROVADA" ? "Processo aprovado. " : "Processo encerrado. "}
            </strong>
            {candidatura.motivoEncerramento}
          </Alert>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="etapas-processo"
            className="rounded-panel border border-border bg-card p-5 shadow-card sm:p-6"
          >
            <h2 id="etapas-processo" className="text-base font-bold tracking-tight text-foreground">
              Onde você está
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              O processo tem sete etapas fixas. Cada avanço da empresa também chega no seu e-mail.
            </p>

            <EtapaTrilha
              etapa={candidatura.etapaAtual}
              status={candidatura.status}
              className="mt-6"
            />
          </section>

          <section
            aria-labelledby="feedbacks-processo"
            className="rounded-panel border border-border bg-card p-5 shadow-card sm:p-6"
          >
            <h2
              id="feedbacks-processo"
              className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground"
            >
              <MessageSquareQuote className="size-[18px] text-primary" aria-hidden />
              Feedbacks da empresa
            </h2>

            {feedbacks.length > 0 ? (
              <div className="mt-5 flex flex-col gap-6">
                {Object.entries(feedbacksPorEtapa).map(([etapa, itens]) => (
                  <div key={etapa}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {ETAPA_LABELS[etapa as EtapaProcesso]}
                    </h3>
                    <div className="mt-3 flex flex-col gap-3">
                      {itens.map((feedback) => (
                        <FeedbackCard key={feedback.id} feedback={feedback} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquareQuote}
                title="Nenhum feedback ainda"
                description="Quando a empresa registrar um retorno de etapa, ele aparece aqui e no seu e-mail."
                className="mt-5 py-10"
              />
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <section
            aria-labelledby="dados-candidatura"
            className="rounded-panel border border-border bg-card p-5 shadow-card"
          >
            <h2
              id="dados-candidatura"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Sua candidatura
            </h2>

            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Enviada em</dt>
                <dd className="font-semibold text-foreground">
                  {formatDate(candidatura.createdAt) || "—"}
                </dd>
              </div>
              {candidatura.finalizadaEm && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Encerrada em</dt>
                  <dd className="font-semibold text-foreground">
                    {formatDate(candidatura.finalizadaEm)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Feedbacks</dt>
                <dd className="font-semibold tabular-nums text-foreground">{feedbacks.length}</dd>
              </div>
            </dl>

            {candidatura.curriculoUrl && (
              <a
                href={candidatura.curriculoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 flex items-center gap-2 border-t border-border-subtle pt-4 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                <ExternalLink className="size-4" aria-hidden />
                Currículo enviado
              </a>
            )}

            {candidatura.cartaApresentacao && (
              <div className="mt-4 border-t border-border-subtle pt-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <FileText className="size-4 text-primary" aria-hidden />
                  Carta enviada
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground text-pretty">
                  {candidatura.cartaApresentacao}
                </p>
              </div>
            )}
          </section>

          <section
            aria-labelledby="historico-processo"
            className="rounded-panel border border-border bg-card p-5 shadow-card"
          >
            <h2
              id="historico-processo"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              <History className="size-4" aria-hidden />
              Histórico
            </h2>
            <div className="mt-4">
              <HistoricoTimeline historico={historico} />
            </div>
          </section>

          {!encerrada && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="btn-secondary border-danger-border text-danger-foreground hover:bg-danger-subtle"
            >
              Desistir do processo
            </button>
          )}
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Desistir do processo"
        description="Sua candidatura fica registrada como cancelada e a empresa é avisada. O histórico e os feedbacks continuam disponíveis para você."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={desistindo}
              className="btn-secondary"
            >
              Continuar no processo
            </button>
            <button
              type="button"
              onClick={() => void desistir()}
              disabled={desistindo}
              className="btn-primary bg-danger hover:bg-danger-foreground"
            >
              {desistindo && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {desistindo ? "Cancelando" : "Confirmar desistência"}
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Você está no processo de <strong className="font-semibold text-foreground">
            {candidatura.vagaTitulo}
          </strong>{" "}
          na {company}, atualmente na etapa de {ETAPA_LABELS[candidatura.etapaAtual]}. Essa ação não
          pode ser desfeita.
        </p>

        {acaoErro && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-subtle px-4 py-3">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger-foreground" aria-hidden />
            <p role="alert" className="text-sm font-medium leading-relaxed text-danger-foreground">
              {acaoErro}
            </p>
          </div>
        )}
      </Modal>
    </PageShell>
  )
}
