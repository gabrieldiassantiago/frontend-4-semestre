import { Check, MessageSquareQuote, Star, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  ETAPAS,
  ETAPA_HINTS,
  ETAPA_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  etapaIndex,
  type Candidatura,
  type CandidaturaFeedback,
  type CandidaturaHistorico,
  type EtapaProcesso,
  type StatusCandidatura,
} from "@/lib/types/candidatura.types"

/** Badge de status com a variante correta já resolvida. */
export function StatusBadge({
  status,
  size = "md",
}: {
  status: StatusCandidatura
  size?: "sm" | "md"
}) {
  return (
    <Badge variant={STATUS_BADGE[status]} size={size}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

/** Nota de 1 a 5 do feedback. */
export function NotaEstrelas({ nota }: { nota: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Nota ${nota} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "size-3.5",
            index < nota ? "fill-warning text-warning" : "text-border-strong",
          )}
        />
      ))}
    </span>
  )
}

/**
 * Barra compacta das 7 etapas, para linhas de lista e cards.
 * Quando a candidatura é encerrada, a etapa alcançada continua marcada — é a
 * informação de "até onde a pessoa chegou".
 */
export function EtapaProgresso({
  etapa,
  status,
  className,
}: {
  etapa: EtapaProcesso
  status: StatusCandidatura
  className?: string
}) {
  const current = etapaIndex(etapa)
  const tone =
    status === "REPROVADA"
      ? "bg-danger"
      : status === "APROVADA"
        ? "bg-success"
        : status === "CANCELADA"
          ? "bg-border-strong"
          : "bg-primary"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ol
        className="flex items-center gap-1"
        aria-label={`Etapa ${current + 1} de ${ETAPAS.length}: ${ETAPA_LABELS[etapa]}`}
      >
        {ETAPAS.map((item, index) => (
          <li key={item}>
            <span
              className={cn(
                "block h-1.5 w-5 rounded-full transition-colors sm:w-7",
                index <= current ? tone : "bg-border",
              )}
            />
            <span className="sr-only">
              {ETAPA_LABELS[item]}: {index <= current ? "alcançada" : "pendente"}
            </span>
          </li>
        ))}
      </ol>
      <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
        {ETAPA_LABELS[etapa]}
      </span>
    </div>
  )
}

/**
 * Trilha vertical completa das etapas, com a explicação de cada uma.
 * É o núcleo do acompanhamento: o candidato entende onde está e o que vem.
 */
export function EtapaTrilha({
  etapa,
  status,
  className,
}: {
  etapa: EtapaProcesso
  status: StatusCandidatura
  className?: string
}) {
  const current = etapaIndex(etapa)
  const encerradaSemAprovacao = status === "REPROVADA" || status === "CANCELADA"

  return (
    <ol className={cn("flex flex-col", className)}>
      {ETAPAS.map((item, index) => {
        const done = index < current
        const active = index === current
        const pending = index > current

        return (
          <li key={item} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors",
                  done && "border-transparent bg-success text-strong-contrast",
                  active &&
                    !encerradaSemAprovacao &&
                    "border-transparent bg-primary text-primary-foreground",
                  active && encerradaSemAprovacao && "border-transparent bg-danger text-strong-contrast",
                  pending && "border-border-strong bg-card text-subtle-foreground",
                )}
              >
                {done ? (
                  <Check className="size-4" aria-hidden />
                ) : active && encerradaSemAprovacao ? (
                  <X className="size-4" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>

              {index < ETAPAS.length - 1 && (
                <span
                  aria-hidden
                  className={cn("w-px flex-1 self-stretch", done ? "bg-success" : "bg-border")}
                />
              )}
            </div>

            <div className={cn("min-w-0 pb-6", index === ETAPAS.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-bold",
                  pending ? "text-subtle-foreground" : "text-foreground",
                )}
              >
                {ETAPA_LABELS[item]}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed text-pretty",
                  pending ? "text-subtle-foreground" : "text-muted-foreground",
                )}
              >
                {ETAPA_HINTS[item]}
              </p>
              {active && (
                <div className="mt-2">
                  <StatusBadge status={status} size="sm" />
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Uma linha do histórico imutável gerado pelo backend. */
export function HistoricoTimeline({ historico }: { historico: CandidaturaHistorico[] }) {
  if (historico.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        O histórico aparece aqui conforme a empresa movimenta o processo.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-4">
      {historico.map((item) => {
        const mudouEtapa = item.etapaAnterior && item.etapaAnterior !== item.etapaNova
        const mudouStatus = item.statusAnterior && item.statusAnterior !== item.statusNovo

        return (
          <li key={item.id} className="flex gap-3">
            <span
              aria-hidden
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary ring-4 ring-primary-subtle"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground text-pretty">
                {mudouEtapa
                  ? `${ETAPA_LABELS[item.etapaAnterior as EtapaProcesso]} → ${ETAPA_LABELS[item.etapaNova]}`
                  : mudouStatus
                    ? `Situação atualizada para ${STATUS_LABELS[item.statusNovo]}`
                    : `${ETAPA_LABELS[item.etapaNova]} · ${STATUS_LABELS[item.statusNovo]}`}
              </p>
              {item.observacao && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.observacao}
                </p>
              )}
              <p className="mt-1 text-xs text-subtle-foreground">
                {[item.autorNome, formatDate(item.createdAt)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Card de feedback. `actions` só é usado no painel da empresa. */
export function FeedbackCard({
  feedback,
  actions,
}: {
  feedback: CandidaturaFeedback
  actions?: React.ReactNode
}) {
  return (
    <article className="rounded-card border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="outline" size="sm">
            {ETAPA_LABELS[feedback.etapa]}
          </Badge>
          <h4 className="mt-2 text-sm font-bold text-foreground text-pretty">{feedback.titulo}</h4>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {typeof feedback.nota === "number" && <NotaEstrelas nota={feedback.nota} />}
          {actions}
        </div>
      </div>

      <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-strong-foreground text-pretty">
        {feedback.mensagem}
      </p>

      <p className="mt-3 text-xs text-subtle-foreground">
        {[feedback.autorNome, formatDate(feedback.createdAt)].filter(Boolean).join(" · ")}
      </p>
    </article>
  )
}

/** Cabeçalho reutilizável com vaga, empresa e situação. */
export function CandidaturaResumo({
  candidatura,
  className,
}: {
  candidatura: Candidatura
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="truncate text-xs font-semibold text-muted-foreground">
        {candidatura.nomeEmpresa ?? "Empresa confidencial"}
      </p>
      <h3 className="mt-1 truncate text-sm font-bold text-foreground">{candidatura.vagaTitulo}</h3>
    </div>
  )
}

/** Contador de feedbacks recebidos, usado nas listagens. */
export function FeedbackCount({ total }: { total: number }) {
  if (total <= 0) return null

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
      <MessageSquareQuote className="size-3.5" aria-hidden />
      {total} {total === 1 ? "feedback" : "feedbacks"}
    </span>
  )
}
