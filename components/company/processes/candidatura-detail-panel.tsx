"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
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
import {
  EtapaTrilha,
  FeedbackCard,
  HistoricoTimeline,
  StatusBadge,
} from "@/components/candidatura/candidatura-ui"
import {
  atualizarFeedback,
  avancarEtapa,
  criarFeedback,
  decidirCandidatura,
  removerFeedback,
} from "@/lib/services/candidatura.service"
import { revalidarCandidatura, useCandidaturaEmpresa } from "@/lib/hooks/useCandidaturas"
import { getErrorMessage } from "@/lib/errors"
import { formatDate } from "@/lib/format"
import {
  ETAPA_LABELS,
  etapasAteAtual,
  etapasPosteriores,
  isFinalizada,
  type CandidaturaFeedback,
  type EtapaProcesso,
} from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

type Aba = "processo" | "feedbacks" | "historico"

const ABAS: { id: Aba; label: string }[] = [
  { id: "processo", label: "Processo" },
  { id: "feedbacks", label: "Feedbacks" },
  { id: "historico", label: "Histórico" },
]

/**
 * Painel de gestão de uma candidatura.
 * Concentra as três ações da empresa — avançar etapa, decidir e registrar
 * feedback — cada uma como um passo curto e explícito, para que ninguém
 * movimente um processo sem entender o efeito.
 */
export function CandidaturaDetailPanel({ candidaturaId, showDocuments = true }: { candidaturaId: string; showDocuments?: boolean }) {
  const { detalhe, loading, error, refetch } = useCandidaturaEmpresa(candidaturaId)
  const [aba, setAba] = useState<Aba>("processo")

  useEffect(() => {
    setAba("processo")
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

  const { candidatura, historico, feedbacks } = detalhe
  const finalizada = isFinalizada(candidatura.status)

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3 border-b border-border-subtle px-5 py-4">
        <EntityAvatar name={candidatura.candidatoNome} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-foreground">
            {candidatura.candidatoNome ?? "Candidato"}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{candidatura.vagaTitulo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={candidatura.status} size="sm" />
            <Badge variant="outline" size="sm">
              {ETAPA_LABELS[candidatura.etapaAtual]}
            </Badge>
          </div>
        </div>
      </div>

      {candidatura.candidatoEmail && (
        <a
          href={`mailto:${candidatura.candidatoEmail}`}
          className="flex items-center gap-2 border-b border-border-subtle px-5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-muted"
        >
          <Mail className="size-3.5" aria-hidden />
          <span className="truncate">{candidatura.candidatoEmail}</span>
        </a>
      )}

      <div
        role="tablist"
        aria-label="Seções da candidatura"
        className="flex gap-1 border-b border-border-subtle px-3 py-2"
      >
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={aba === item.id}
            onClick={() => setAba(item.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
              aba === item.id
                ? "bg-primary-subtle text-primary-subtle-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {item.label}
            {item.id === "feedbacks" && feedbacks.length > 0 && (
              <span className="ml-1.5 tabular-nums">{feedbacks.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 p-5">
        {aba === "processo" && (
          <>
            {showDocuments && candidatura.cartaApresentacao && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-subtle-foreground">
                  Carta de apresentação
                </h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-strong-foreground text-pretty">
                  {candidatura.cartaApresentacao}
                </p>
              </section>
            )}

            {showDocuments && candidatura.curriculoUrl && (
              <a
                href={candidatura.curriculoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full"
              >
                Abrir currículo
              </a>
            )}

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
                onDone={refetch}
              />
            )}

            <section>
              <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-subtle-foreground">
                Etapas
              </h4>
              <EtapaTrilha
                etapa={candidatura.etapaAtual}
                status={candidatura.status}
                className="mt-4"
              />
            </section>
          </>
        )}

        {aba === "feedbacks" && (
          <FeedbacksManager
            candidaturaId={candidatura.id}
            etapaAtual={candidatura.etapaAtual}
            feedbacks={feedbacks}
            onDone={refetch}
          />
        )}

        {aba === "historico" && <HistoricoTimeline historico={historico} />}
      </div>
    </div>
  )
}

/** Avançar etapa e decidir, cada ação com o seu próprio passo de confirmação. */
function AcoesProcesso({
  candidaturaId,
  etapaAtual,
  onDone,
}: {
  candidaturaId: string
  etapaAtual: EtapaProcesso
  onDone: () => void
}) {
  const [acao, setAcao] = useState<"nenhuma" | "avancar" | "aprovar" | "reprovar">("nenhuma")
  const [etapa, setEtapa] = useState<EtapaProcesso | "">("")
  const [texto, setTexto] = useState("")
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const posteriores = useMemo(() => etapasPosteriores(etapaAtual), [etapaAtual])

  function reset() {
    setAcao("nenhuma")
    setEtapa("")
    setTexto("")
    setErro(null)
  }

  async function submit() {
    setSaving(true)
    setErro(null)

    try {
      if (acao === "avancar") {
        if (!etapa) {
          setErro("Escolha a etapa de destino.")
          return
        }
        await avancarEtapa(candidaturaId, {
          etapa,
          observacao: texto.trim() || undefined,
        })
      } else {
        await decidirCandidatura(candidaturaId, {
          status: acao === "aprovar" ? "APROVADA" : "REPROVADA",
          motivo: texto.trim() || undefined,
        })
      }

      await revalidarCandidatura(candidaturaId)
      onDone()
      reset()
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível concluir a ação."))
    } finally {
      setSaving(false)
    }
  }

  if (acao === "nenhuma") {
    return (
      <div className="flex flex-col gap-2">
        {posteriores.length > 0 && (
          <button type="button" onClick={() => setAcao("avancar")} className="btn-primary w-full">
            <ArrowRight className="size-4" aria-hidden />
            Avançar etapa
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
                  {ETAPA_LABELS[item]}
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
  feedbacks,
  onDone,
}: {
  candidaturaId: string
  etapaAtual: EtapaProcesso
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
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const etapasDisponiveis = useMemo(() => etapasAteAtual(etapaAtual), [etapaAtual])

  async function submit() {
    if (!form) return

    if (!form.titulo.trim() || !form.mensagem.trim()) {
      setErro("Título e mensagem são obrigatórios.")
      return
    }

    setSaving(true)
    setErro(null)

    const dto = {
      etapa: form.etapa,
      titulo: form.titulo.trim(),
      mensagem: form.mensagem.trim(),
      nota: form.nota ? Number(form.nota) : undefined,
    }

    try {
      if (form.id) {
        await atualizarFeedback(candidaturaId, form.id, dto)
      } else {
        await criarFeedback(candidaturaId, dto)
      }
      await revalidarCandidatura(candidaturaId)
      onDone()
      setForm(null)
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível salvar o feedback."))
    } finally {
      setSaving(false)
    }
  }

  async function remover(feedbackId: string) {
    setErro(null)
    try {
      await removerFeedback(candidaturaId, feedbackId)
      await revalidarCandidatura(candidaturaId)
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
                    {ETAPA_LABELS[item]}
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
