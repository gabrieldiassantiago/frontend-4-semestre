// ── Enums ──────────────────────────────────────────────────────────────────

/**
 * Etapas fixas do funil, na mesma ordem do enum `EtapaProcesso` do backend.
 * A ordem do array é a fonte da verdade para "é depois de" — o backend recusa
 * qualquer etapa que não seja posterior à atual.
 */
export const ETAPAS = [
  "INSCRICAO",
  "TRIAGEM",
  "ENTREVISTA_RH",
  "TESTE_TECNICO",
  "ENTREVISTA_TECNICA",
  "PROPOSTA",
  "CONTRATACAO",
] as const

export type EtapaProcesso = (typeof ETAPAS)[number]

export const STATUS_CANDIDATURA = [
  "EM_ANDAMENTO",
  "APROVADA",
  "REPROVADA",
  "CANCELADA",
] as const

export type StatusCandidatura = (typeof STATUS_CANDIDATURA)[number]

// ── Display ────────────────────────────────────────────────────────────────

export const ETAPA_LABELS: Record<EtapaProcesso, string> = {
  INSCRICAO: "Inscrição",
  TRIAGEM: "Triagem",
  ENTREVISTA_RH: "Entrevista RH",
  TESTE_TECNICO: "Teste técnico",
  ENTREVISTA_TECNICA: "Entrevista técnica",
  PROPOSTA: "Proposta",
  CONTRATACAO: "Contratação",
}

/** Frase curta que explica ao candidato o que acontece na etapa. */
export const ETAPA_HINTS: Record<EtapaProcesso, string> = {
  INSCRICAO: "Sua candidatura foi registrada e entrou na fila de análise.",
  TRIAGEM: "A empresa está analisando seu perfil e seu currículo.",
  ENTREVISTA_RH: "Conversa inicial sobre trajetória, expectativas e a vaga.",
  TESTE_TECNICO: "Avaliação prática das habilidades exigidas pela vaga.",
  ENTREVISTA_TECNICA: "Conversa aprofundada com o time técnico.",
  PROPOSTA: "A empresa está montando ou já apresentou uma proposta.",
  CONTRATACAO: "Últimos detalhes para você começar.",
}

export const STATUS_LABELS: Record<StatusCandidatura, string> = {
  EM_ANDAMENTO: "Em andamento",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  CANCELADA: "Cancelada",
}

/** Variantes do Badge por status, para não repetir o mapa em cada tela. */
export const STATUS_BADGE: Record<StatusCandidatura, "primary" | "success" | "danger" | "neutral"> = {
  EM_ANDAMENTO: "primary",
  APROVADA: "success",
  REPROVADA: "danger",
  CANCELADA: "neutral",
}

/** Cor do marcador de coluna no funil da empresa. */
export const ETAPA_DOT: Record<EtapaProcesso, string> = {
  INSCRICAO: "bg-subtle-foreground",
  TRIAGEM: "bg-border-strong",
  ENTREVISTA_RH: "bg-info",
  TESTE_TECNICO: "bg-warning",
  ENTREVISTA_TECNICA: "bg-primary",
  PROPOSTA: "bg-success",
  CONTRATACAO: "bg-success",
}

// ── Helpers de etapa ───────────────────────────────────────────────────────

export function etapaIndex(etapa: EtapaProcesso): number {
  return ETAPAS.indexOf(etapa)
}

/** Mesma regra do `EtapaProcesso.isDepoisDe` do backend. */
export function isEtapaDepoisDe(etapa: EtapaProcesso, referencia: EtapaProcesso): boolean {
  return etapaIndex(etapa) > etapaIndex(referencia)
}

/** Etapas que a empresa pode escolher ao avançar (só as posteriores). */
export function etapasPosteriores(atual: EtapaProcesso): EtapaProcesso[] {
  return ETAPAS.slice(etapaIndex(atual) + 1)
}

/** Etapas em que a empresa pode registrar feedback (atual e anteriores). */
export function etapasAteAtual(atual: EtapaProcesso): EtapaProcesso[] {
  return ETAPAS.slice(0, etapaIndex(atual) + 1)
}

/** A candidatura ainda aceita mudança de etapa/status? */
export function isFinalizada(status: StatusCandidatura): boolean {
  return status !== "EM_ANDAMENTO"
}

// ── Respostas da API ───────────────────────────────────────────────────────

/** `CandidaturaResponse` — usado nas listagens e no topo do detalhe. */
export interface Candidatura {
  id: string
  vagaId: string
  vagaTitulo: string
  nomeEmpresa?: string
  candidatoNome?: string
  candidatoEmail?: string
  candidateProfileId?: string
  etapaAtual: EtapaProcesso
  etapaAtualDescricao?: string
  status: StatusCandidatura
  statusDescricao?: string
  cartaApresentacao?: string
  curriculoUrl?: string
  motivoEncerramento?: string
  totalFeedbacks?: number
  finalizadaEm?: string
  createdAt?: string
  updatedAt?: string
}

/** `HistoricoResponse` — linha imutável da timeline. */
export interface CandidaturaHistorico {
  id: string
  etapaAnterior?: EtapaProcesso
  etapaNova: EtapaProcesso
  statusAnterior?: StatusCandidatura
  statusNovo: StatusCandidatura
  observacao?: string
  autorUserId?: string
  autorNome?: string
  createdAt?: string
}

/** `FeedbackResponse` — todo feedback é visível para o candidato. */
export interface CandidaturaFeedback {
  id: string
  etapa: EtapaProcesso
  titulo: string
  mensagem: string
  nota?: number
  autorUserId?: string
  autorNome?: string
  createdAt?: string
  updatedAt?: string
}

/** `CandidaturaDetalheResponse` — acompanhamento completo. */
export interface CandidaturaDetalhe {
  candidatura: Candidatura
  historico: CandidaturaHistorico[]
  feedbacks: CandidaturaFeedback[]
}

// ── Payloads ───────────────────────────────────────────────────────────────

export interface CreateCandidaturaDto {
  vagaId: string
  cartaApresentacao?: string
  curriculoUrl?: string
}

export interface AvancarEtapaDto {
  etapa: EtapaProcesso
  observacao?: string
}

/** Só `APROVADA` ou `REPROVADA` são aceitas por essa rota. */
export interface DecidirCandidaturaDto {
  status: Extract<StatusCandidatura, "APROVADA" | "REPROVADA">
  motivo?: string
}

export interface CreateFeedbackDto {
  etapa: EtapaProcesso
  titulo: string
  mensagem: string
  nota?: number
}

/** Filtros do painel da empresa (`GET /empresa/candidaturas`). */
export interface CandidaturaFilters {
  vagaId?: string
  status?: StatusCandidatura
  etapa?: EtapaProcesso
  candidatoNome?: string
}
