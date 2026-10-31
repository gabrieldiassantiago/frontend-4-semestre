"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MessageSquarePlus,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Field } from "@/components/ui/form-field"
import { Alert, CardSkeleton, ErrorState } from "@/components/ui/states"
import { Modal } from "@/components/ui/modal"
import {
  FeedbackCard,
  HistoricoTimeline,
  StatusBadge,
} from "@/components/shared/candidatura/candidatura-ui"
import {
  useAtualizarFeedback,
  useAtualizarAgendamento,
  useAvancarEtapa,
  useCancelarAgendamento,
  useCandidaturaEmpresa,
  useCriarFeedback,
  useCriarAgendamento,
  useDecidirCandidatura,
  useRemoverFeedback,
} from "@/lib/queries/use-candidaturas"
import { getErrorMessage } from "@/lib/errors"
import { formatDate } from "@/lib/format"
import {
  ETAPA_SHORT_LABELS,
  etapasDaVaga,
  etapasAteAtual,
  etapasPosteriores,
  isFinalizada,
  STATUS_AGENDAMENTO_LABELS,
  type CandidaturaAgendamento,
  type CandidaturaDetalhe,
  type CreateAgendamentoDto,
  type CandidaturaFeedback,
  type EtapaProcesso,
} from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

type Aba = "processo" | "agendamentos" | "feedbacks" | "historico"

const ABAS: { id: Aba; label: string }[] = [
  { id: "processo", label: "Processo" },
  { id: "agendamentos", label: "Agendamentos" },
  { id: "feedbacks", label: "Feedbacks" },
  { id: "historico", label: "Histórico" },
]

/**
 * Painel de gestão de uma candidatura.
 * Concentra as três ações da empresa — avançar etapa, decidir e registrar
 * feedback — cada uma como um passo curto e explícito, para que ninguém
 * movimente um processo sem entender o efeito.
 */
export function CandidaturaDetailPanel({
  candidaturaId,
  showDocuments = true,
  showHeader = true,
}: {
  candidaturaId: string
  showDocuments?: boolean
  showHeader?: boolean
}) {
  const { detalhe, loading, error, refetch } = useCandidaturaEmpresa(candidaturaId)
  const [aba, setAba] = useState<Aba>("processo")
  const [perguntarAgendamento, setPerguntarAgendamento] = useState(false)
  ''
  useEffect(() => {
    setAba("processo")
    setPerguntarAgendamento(false)
  }, [candidaturaId])
  if (loading) {
    return (
      <div className="p-5">
        <CardSkeleton rows={2} />
      </div>
    )
  }

  if (error || !detalhe) {
    return (
      <div className="p-5">
        <ErrorState
          description={error ?? "Candidatura não encontrada."}
          action={
            <button type="button" onClick={() => refetch()} className="btn-secondary">
              Tentar novamente
            </button>
          }
        />
      </div>
    )
  }

  const { candidatura, historico, feedbacks, agendamentos = [] } = detalhe
  const finalizada = isFinalizada(candidatura.status)

  const tabCounts: Partial<Record<Aba, number>> = {
    agendamentos: agendamentos.filter((item) => item.status === "PENDENTE" || item.status === "CONFIRMADO").length,
    feedbacks: feedbacks.length,
  }

  return (
    <div className="motion-enter flex flex-col">
      {showHeader && (
        <div className="flex items-start gap-3 bg-card px-5 pb-4 pt-5">
          <EntityAvatar name={candidatura.candidatoNome} src={candidatura.candidatoImagemUrl} size="lg" className="rounded-full" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground">{candidatura.candidatoNome ?? "Candidato"}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {candidatura.candidatoHeadline || candidatura.vagaTitulo}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={candidatura.status} size="sm" />
              <Badge variant="outline" size="sm">
                {ETAPA_SHORT_LABELS[candidatura.etapaAtual]}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {showHeader && candidatura.candidatoEmail && (
        <a
          href={`mailto:${candidatura.candidatoEmail}`}
          className="mx-5 mb-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs font-medium text-strong-foreground transition-colors hover:bg-muted"
        >
          <Mail className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="truncate">{candidatura.candidatoEmail}</span>
        </a>
      )}

      <div role="tablist" aria-label="Seções da candidatura" className="flex gap-3.5 overflow-x-auto border-b border-border px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ABAS.map((item) => {
          const selected = aba === item.id
          const count = tabCounts[item.id]
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setAba(item.id)}
              className={cn(
                "relative -mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 py-3 text-sm font-semibold transition-all duration-200",
                selected ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {count ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[11px] tabular-nums transition-colors",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div key={aba} className="motion-pop flex flex-col gap-5 p-5">
        {aba === "processo" && (
          <>
            {finalizada ? (
              <Alert tone={candidatura.status === "APROVADA" ? "success" : "info"}>
                Processo encerrado como {candidatura.status === "APROVADA" ? "aprovado" : "encerrado"}
                {candidatura.finalizadaEm ? ` em ${formatDate(candidatura.finalizadaEm)}` : ""}.
                {candidatura.motivoEncerramento ? ` ${candidatura.motivoEncerramento}` : ""}
              </Alert>
            ) : (
              <AcoesProcesso
                candidaturaId={candidatura.id}
                etapaAtual={candidatura.etapaAtual}
                etapasVaga={candidatura.etapasVaga}
                onDone={(avancou) => {
                  void refetch()
                  setPerguntarAgendamento(Boolean(avancou))
                }}
              />
            )}

            {showDocuments && (candidatura.cartaApresentacao || candidatura.curriculoUrl) && (
              <section className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documentos</h4>
                {candidatura.cartaApresentacao && (
                  <p className="line-clamp-6 whitespace-pre-line border-l-2 border-primary/40 pl-3 text-sm leading-relaxed text-strong-foreground text-pretty">
                    {candidatura.cartaApresentacao}
                  </p>
                )}
                {candidatura.curriculoUrl && (
                  <a href={candidatura.curriculoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
                    <FileText className="size-4" aria-hidden />
                    Abrir currículo
                  </a>
                )}
              </section>
            )}

            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Etapas da vaga</h4>
              <EtapasEmpresa
                etapa={candidatura.etapaAtual}
                status={candidatura.status}
                etapasVaga={candidatura.etapasVaga}
                historico={historico}
              />
            </section>
          </>
        )}

        {aba === "agendamentos" && (
          <AgendamentosManager
            candidaturaId={candidatura.id}
            etapaAtual={candidatura.etapaAtual}
            etapasVaga={candidatura.etapasVaga}
            agendamentos={agendamentos}
            disabled={finalizada}
            onDone={refetch}
          />
        )}

        {aba === "feedbacks" && (
          <FeedbacksManager
            candidaturaId={candidatura.id}
            etapaAtual={candidatura.etapaAtual}
            etapasVaga={candidatura.etapasVaga}
            feedbacks={feedbacks}
            onDone={refetch}
          />
        )}

        {aba === "historico" && <HistoricoTimeline historico={historico} />}
      </div>

      <Modal
        open={perguntarAgendamento}
        onClose={() => setPerguntarAgendamento(false)}
        title="Agendar conversa com o candidato?"
        description={`${candidatura.candidatoNome ?? "O candidato"} avançou para ${ETAPA_SHORT_LABELS[candidatura.etapaAtual]}.`}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPerguntarAgendamento(false)}
              className="btn-ghost"
            >
              Agora não
            </button>
            <button
              type="button"
              onClick={() => {
                setPerguntarAgendamento(false)
                setAba("agendamentos")
              }}
              className="btn-primary"
            >
              Agendar agora
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Você pode criar uma reunião, entrevista ou outro compromisso vinculado a esta etapa.
        </p>
      </Modal>
    </div>
  )
}

/** Trilha vertical das etapas com a data em que o candidato chegou a cada uma. */
function EtapasEmpresa({
  etapa,
  status,
  etapasVaga,
  historico,
}: {
  etapa: EtapaProcesso
  status: CandidaturaDetalhe["candidatura"]["status"]
  etapasVaga?: Array<{ etapa: EtapaProcesso; ordem: number }>
  historico: CandidaturaDetalhe["historico"]
}) {
  const flow = etapasDaVaga(etapasVaga)
  const current = flow.indexOf(etapa)
  const failed = status === "REPROVADA" || status === "CANCELADA"

  return (
    <ol className="mt-3 flex flex-col">
      {flow.map((item, index) => {
        const done = index < current || (status === "APROVADA" && index === current)
        const active = index === current && status !== "APROVADA"
        const reachedAt = historico.find((entry) => entry.etapaNova === item)?.createdAt
        return (
          <li key={item} className="relative flex items-start gap-3 pb-4 last:pb-0">
            {index < flow.length - 1 && (
              <span aria-hidden className={cn("absolute left-[11px] top-6 h-[calc(100%-16px)] w-px", done ? "bg-primary" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && !failed && "border-primary bg-primary-subtle text-primary shadow-[0_0_0_3px_var(--primary-ring)]",
                active && failed && "border-danger bg-danger-subtle text-danger-foreground",
                index > current && "border-border bg-card text-subtle-foreground",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : active && failed ? <XCircle className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 pt-0.5">
              <p className={cn("truncate text-sm", index > current ? "text-subtle-foreground" : "font-semibold text-foreground")}>
                {ETAPA_SHORT_LABELS[item]}
                {active && <span className="sr-only"> (etapa atual)</span>}
              </p>
              {reachedAt && index <= current && (
                <span className="shrink-0 text-[11px] text-subtle-foreground">{formatDate(reachedAt, { day: "2-digit", month: "short" })}</span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function toDateTimeLocal(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 16)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function AgendamentosManager({
  candidaturaId,
  etapaAtual,
  etapasVaga,
  agendamentos,
  disabled,
  onDone,
}: {
  candidaturaId: string
  etapaAtual: EtapaProcesso
  etapasVaga?: Array<{ etapa: EtapaProcesso; ordem: number }>
  agendamentos: CandidaturaAgendamento[]
  disabled: boolean
  onDone: () => void
}) {
  const [form, setForm] = useState<(CreateAgendamentoDto & { id?: string }) | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const criar = useCriarAgendamento()
  const atualizar = useAtualizarAgendamento()
  const cancelar = useCancelarAgendamento()
  const saving = criar.isPending || atualizar.isPending || cancelar.isPending
  const etapasDisponiveis = useMemo(() => etapasAteAtual(etapaAtual, etapasVaga), [etapaAtual, etapasVaga])

  function novo() {
    setErro(null)
    setForm({ etapa: etapaAtual, titulo: "", mensagem: "", inicio: "", duracaoMinutos: 30, link: "" })
  }

  async function salvar() {
    if (!form) return
    if (!form.titulo.trim() || !form.inicio || !form.link.trim()) {
      setErro("Preencha título, data e horário e link da reunião.")
      return
    }
    setErro(null)
    const dto: CreateAgendamentoDto = {
      etapa: form.etapa,
      titulo: form.titulo.trim(),
      mensagem: form.mensagem?.trim() || undefined,
      inicio: new Date(form.inicio).toISOString(),
      duracaoMinutos: Number(form.duracaoMinutos),
      link: form.link.trim(),
    }
    try {
      if (form.id) await atualizar.mutateAsync({ id: candidaturaId, agendamentoId: form.id, dto })

      else await criar.mutateAsync({ id: candidaturaId, dto })
      setForm(null)
      onDone()
    } catch (requestError) {
      setErro(getErrorMessage(requestError, "Não foi possível salvar o agendamento."))
    }
  }

  async function remover(agendamento: CandidaturaAgendamento) {
    setErro(null)
    try {
      await cancelar.mutateAsync({ id: candidaturaId, agendamentoId: agendamento.id })
      onDone()
    } catch (requestError) {
      setErro(getErrorMessage(requestError, "Não foi possível cancelar o agendamento."))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert tone="danger">{erro}</Alert>}

      {form && (
        <section className="motion-pop rounded-xl border border-border bg-muted/40 p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-foreground">{form.id ? "Editar agendamento" : "Novo agendamento"}</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">O candidato receberá o convite e poderá confirmar ou recusar.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etapa">
              <select className="field-input" value={form.etapa} onChange={(event) => setForm({ ...form, etapa: event.target.value as EtapaProcesso })}>
                {etapasDisponiveis.map((item) => <option key={item} value={item}>{ETAPA_SHORT_LABELS[item]}</option>)}
              </select>
            </Field>
            <Field label="Duração">
              <select className="field-input" value={form.duracaoMinutos} onChange={(event) => setForm({ ...form, duracaoMinutos: Number(event.target.value) })}>
                {[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutos</option>)}
              </select>
            </Field>
            <Field label="Título" wide>
              <input className="field-input" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} placeholder="Ex.: Entrevista com RH" />
            </Field>
            <Field label="Data e horário">
              <input className="field-input" type="datetime-local" value={form.inicio} onChange={(event) => setForm({ ...form, inicio: event.target.value })} />
            </Field>
            <Field label="Link da reunião" wide>
              <input className="field-input" type="url" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} placeholder="https://meet.google.com/..." />
            </Field>
            <Field label="Mensagem" wide hint="Opcional. Aparece para o candidato junto do convite.">
              <textarea className="field-input min-h-[88px] resize-y" value={form.mensagem ?? ""} onChange={(event) => setForm({ ...form, mensagem: event.target.value })} placeholder="Explique como será a conversa ou o que o candidato deve preparar." />
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setForm(null)} className="btn-ghost flex-1" disabled={saving}>Cancelar</button>
            <button type="button" onClick={() => void salvar()} className="btn-primary flex-1" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {saving ? "Salvando…" : form.id ? "Salvar alterações" : "Enviar convite"}
            </button>
          </div>
        </section>
      )}

      {!form && !disabled && (
        <button type="button" onClick={novo} className="btn-primary w-full">
          <CalendarClock className="size-4" aria-hidden />
          Criar agendamento
        </button>
      )}

      {agendamentos.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">Nenhum agendamento para esta candidatura.</p>
      ) : (
        <div className="motion-stagger flex flex-col gap-3">
          {agendamentos.map((agendamento, index) => {
            const isPast = ["CANCELADO", "RECUSADO", "REALIZADO", "NAO_COMPARECEU"].includes(agendamento.status)
            return (
              <article
                key={agendamento.id}
                style={{ "--stagger-index": index } as React.CSSProperties}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-all duration-200",
                  isPast
                    ? "border-border opacity-70 hover:opacity-100"
                    : "border-border hover:border-primary/25 hover:shadow-[0_2px_12px_-4px_rgba(124,58,237,0.12)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground">{agendamento.titulo}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ETAPA_SHORT_LABELS[agendamento.etapa]}
                      {" · "}
                      {formatDate(agendamento.inicio, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" · "}{agendamento.duracaoMinutos} min
                    </p>
                  </div>
                  <Badge variant={agendamento.status === "CONFIRMADO" ? "success" : agendamento.status === "CANCELADO" || agendamento.status === "RECUSADO" ? "danger" : "outline"} size="sm">
                    {STATUS_AGENDAMENTO_LABELS[agendamento.status]}
                  </Badge>
                </div>
                {agendamento.mensagem && (
                  <p className="mt-2.5 whitespace-pre-line rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    {agendamento.mensagem}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
                  {agendamento.status !== "CANCELADO" && agendamento.status !== "RECUSADO" && (
                    <a href={agendamento.link} target="_blank" rel="noopener noreferrer" className="btn-secondary h-7 gap-1 px-2.5 text-xs">
                      <ExternalLink className="size-3" aria-hidden /> Abrir link
                    </a>
                  )}
                  {!disabled && !agendamento.status.includes("CANCELADO") && !agendamento.status.includes("RECUSADO") && !["REALIZADO", "NAO_COMPARECEU"].includes(agendamento.status) && (
                    <>
                      <button type="button" onClick={() => setForm({ id: agendamento.id, etapa: agendamento.etapa, titulo: agendamento.titulo, mensagem: agendamento.mensagem ?? "", inicio: toDateTimeLocal(agendamento.inicio), duracaoMinutos: agendamento.duracaoMinutos, link: agendamento.link })} className="btn-ghost h-7 px-2.5 text-xs">
                        Editar
                      </button>
                      <button type="button" onClick={() => void remover(agendamento)} className="btn-ghost h-7 px-2.5 text-xs text-danger-foreground" disabled={saving}>
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Avançar etapa e decidir, cada ação com o seu próprio passo de confirmação. */
function AcoesProcesso({
  candidaturaId,
  etapaAtual,
  etapasVaga,
  onDone,
}: {
  candidaturaId: string
  etapaAtual: EtapaProcesso
  etapasVaga?: Array<{ etapa: EtapaProcesso; ordem: number }>
  onDone: (avancou?: boolean) => void
}) {
  const [acao, setAcao] = useState<"nenhuma" | "avancar" | "aprovar" | "reprovar">("nenhuma")
  const [etapa, setEtapa] = useState<EtapaProcesso | "">("")
  const [texto, setTexto] = useState("")
  const avancarEtapa = useAvancarEtapa()
  const decidirCandidatura = useDecidirCandidatura()
  const saving = avancarEtapa.isPending || decidirCandidatura.isPending
  const [erro, setErro] = useState<string | null>(null)

  const posteriores = useMemo(() => etapasPosteriores(etapaAtual, etapasVaga), [etapaAtual, etapasVaga])

  function reset() {
    setAcao("nenhuma")
    setEtapa("")
    setTexto("")
    setErro(null)
  }

  async function submit() {
    setErro(null)

    try {
      if (acao === "avancar") {
        if (!etapa) {
          setErro("Escolha a etapa de destino.")
          return
        }
        await avancarEtapa.mutateAsync({
          id: candidaturaId,
          dto: { etapa, observacao: texto.trim() || undefined },
        })
      } else {
        await decidirCandidatura.mutateAsync({
          id: candidaturaId,
          dto: { status: acao === "aprovar" ? "APROVADA" : "REPROVADA", motivo: texto.trim() || undefined },
        })
      }

      onDone(acao === "avancar")
      reset()
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível concluir a ação."))
    }
  }

  if (acao === "nenhuma") {
    const proxima = posteriores[0]
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Etapa atual</p>
            <p className="truncate text-sm font-semibold text-foreground">{ETAPA_SHORT_LABELS[etapaAtual]}</p>
          </div>
          {proxima && (
            <div className="min-w-0 text-right">
              <p className="text-xs font-medium text-muted-foreground">Próxima</p>
              <p className="truncate text-sm font-semibold text-primary-subtle-foreground">{ETAPA_SHORT_LABELS[proxima]}</p>
            </div>
          )}
        </div>
        {proxima && (
          <button
            type="button"
            onClick={() => {
              setEtapa(proxima)
              setAcao("avancar")
            }}
            className="btn-primary w-full"
          >
            <ArrowRight className="size-4" aria-hidden />
            Avançar para {ETAPA_SHORT_LABELS[proxima]}
          </button>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAcao("aprovar")}
            className="btn-secondary flex-1 border-success-border text-success-foreground"
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Aprovar
          </button>
          <button
            type="button"
            onClick={() => setAcao("reprovar")}
            className="btn-secondary flex-1 border-danger-border text-danger-foreground"
          >
            <XCircle className="size-4" aria-hidden />
            Reprovar
          </button>
        </div>
      </div>
    )
  }

  const titulo =
    acao === "avancar"
      ? "Avançar etapa"
      : acao === "aprovar"
        ? "Aprovar candidatura"
        : "Reprovar candidatura"

  return (
    <section className="rounded-card border border-border bg-muted/50 p-4">
      <h4 className="text-sm font-bold text-foreground">{titulo}</h4>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
        {acao === "avancar"
          ? "Só é possível mover para uma etapa posterior à atual. O candidato vê a mudança no acompanhamento."
          : acao === "aprovar"
            ? "A candidatura vai para Contratação e o processo é encerrado como aprovado."
            : "O processo é encerrado. O motivo fica visível no histórico do candidato."}
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {acao === "avancar" && (
          <Field label="Etapa de destino">
            <select
              className="field-input"
              value={etapa}
              onChange={(event) => setEtapa(event.target.value as EtapaProcesso)}
            >
              <option value="">Selecione</option>
              {posteriores.map((item) => (
                <option key={item} value={item}>
                  {ETAPA_SHORT_LABELS[item]}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field
          label={acao === "avancar" ? "Observação" : "Motivo"}
          hint="Opcional. Fica registrado no histórico."
        >
          <textarea
            className="field-input min-h-24 resize-y"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder={
              acao === "avancar"
                ? "Ex.: Aprovado na triagem, entrevista agendada."
                : "Ex.: Perfil muito sênior para o escopo da vaga."
            }
          />
        </Field>

        {erro && <Alert tone="danger">{erro}</Alert>}

        <div className="flex gap-2">
          <button type="button" onClick={reset} className="btn-ghost flex-1" disabled={saving}>
            Cancelar
          </button>
          <button type="button" onClick={submit} className="btn-primary flex-1" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Confirmar
          </button>
        </div>
      </div>
    </section>
  )
}

/** CRUD de feedbacks, restrito às etapas já alcançadas. */
function FeedbacksManager({
  candidaturaId,
  etapaAtual,
  etapasVaga,
  feedbacks,
  onDone,
}: {
  candidaturaId: string
  etapaAtual: EtapaProcesso
  etapasVaga?: Array<{ etapa: EtapaProcesso; ordem: number }>
  feedbacks: CandidaturaFeedback[]
  onDone: () => void
}) {
  const [form, setForm] = useState<{
    id?: string
    etapa: EtapaProcesso
    titulo: string
    mensagem: string
    nota: string
  } | null>(null)
  const criarFeedback = useCriarFeedback()
  const atualizarFeedback = useAtualizarFeedback()
  const removerFeedback = useRemoverFeedback()
  const saving = criarFeedback.isPending || atualizarFeedback.isPending
  const [erro, setErro] = useState<string | null>(null)

  const etapasDisponiveis = useMemo(() => etapasAteAtual(etapaAtual, etapasVaga), [etapaAtual, etapasVaga])

  async function submit() {
    if (!form) return

    if (!form.titulo.trim() || !form.mensagem.trim()) {
      setErro("Título e mensagem são obrigatórios.")
      return
    }

    setErro(null)

    const dto = {
      etapa: form.etapa,
      titulo: form.titulo.trim(),
      mensagem: form.mensagem.trim(),
      nota: form.nota ? Number(form.nota) : undefined,
    }

    try {
      if (form.id) {
        await atualizarFeedback.mutateAsync({ id: candidaturaId, feedbackId: form.id, dto })
      } else {
        await criarFeedback.mutateAsync({ id: candidaturaId, dto })
      }
      onDone()
      setForm(null)
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível salvar o feedback."))
    }
  }

  async function remover(feedbackId: string) {
    setErro(null)
    try {
      await removerFeedback.mutateAsync({ id: candidaturaId, feedbackId })
      onDone()
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível remover o feedback."))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && <Alert tone="danger">{erro}</Alert>}

      {form ? (
        <section className="rounded-card border border-border bg-muted/50 p-4">
          <h4 className="text-sm font-bold text-foreground">
            {form.id ? "Editar feedback" : "Novo feedback"}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
            O candidato vê todo feedback publicado. Só é possível registrar em etapas já alcançadas.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <Field label="Etapa">
              <select
                className="field-input"
                value={form.etapa}
                onChange={(event) =>
                  setForm({ ...form, etapa: event.target.value as EtapaProcesso })
                }
              >
                {etapasDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {ETAPA_SHORT_LABELS[item]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Título">
              <input
                className="field-input"
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                placeholder="Ex.: Resultado da entrevista técnica"
              />
            </Field>

            <Field label="Mensagem">
              <textarea
                className="field-input min-h-32 resize-y"
                value={form.mensagem}
                onChange={(event) => setForm({ ...form, mensagem: event.target.value })}
                placeholder="Pontos fortes, pontos de atenção e próximos passos."
              />
            </Field>

            <Field label="Nota" hint="Opcional, de 1 a 5.">
              <select
                className="field-input"
                value={form.nota}
                onChange={(event) => setForm({ ...form, nota: event.target.value })}
              >
                <option value="">Sem nota</option>
                {[1, 2, 3, 4, 5].map((nota) => (
                  <option key={nota} value={String(nota)}>
                    {nota}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="btn-ghost flex-1"
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="button" onClick={submit} className="btn-primary flex-1" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Salvar
              </button>
            </div>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() =>
            setForm({ etapa: etapaAtual, titulo: "", mensagem: "", nota: "" })
          }
          className="btn-secondary w-full"
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          Registrar feedback
        </button>
      )}

      {feedbacks.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Nenhum feedback registrado. Um retorno claro em cada etapa é o que diferencia um processo
          bem conduzido.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              actions={
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Editar feedback ${feedback.titulo}`}
                    onClick={() =>
                      setForm({
                        id: feedback.id,
                        etapa: feedback.etapa,
                        titulo: feedback.titulo,
                        mensagem: feedback.mensagem,
                        nota: feedback.nota ? String(feedback.nota) : "",
                      })
                    }
                    className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover feedback ${feedback.titulo}`}
                    onClick={() => remover(feedback.id)}
                    className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
