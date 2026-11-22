export const ETAPAS = [
  "INSCRICAO",
  "TRIAGEM",
  "ENTREVISTA_RH",
  "TESTE_TECNICO",
  "ENTREVISTA_TECNICA",
  "PROPOSTA",
  "CONTRATACAO",
] as const

/** Identificador da etapa retornado pela API (UUID). */
export type EtapaProcesso = string

export interface EtapaFluxo {
  etapa: string
  ordem: number
  nome?: string
  descricao?: string
}

export function etapaLabel(etapa: string, fluxo?: EtapaFluxo[], fallback?: string): string {
  return fluxo?.find(item => item.etapa === etapa)?.nome || fallback || ETAPA_LABELS[etapa] || "Etapa do processo"
}

export const STATUS_CANDIDATURA = [
  "EM_ANDAMENTO",
  "APROVADA",
  "REPROVADA",
  "CANCELADA",
] as const

export type StatusCandidatura = (typeof STATUS_CANDIDATURA)[number]

export const STATUS_AGENDAMENTO = [
  "PENDENTE",
  "CONFIRMADO",
  "RECUSADO",
  "CANCELADO",
  "REALIZADO",
  "NAO_COMPARECEU",
] as const

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number]


export const ETAPA_LABELS: Record<EtapaProcesso, string> = {
  INSCRICAO: "Inscrição recebida",
  TRIAGEM: "Em triagem",
  ENTREVISTA_RH: "Entrevista com RH",
  TESTE_TECNICO: "Teste técnico",
  ENTREVISTA_TECNICA: "Entrevista técnica",
  PROPOSTA: "Proposta de contratação",
  CONTRATACAO: "Contratação",
}

export const ETAPA_SHORT_LABELS: Record<EtapaProcesso, string> = {
  INSCRICAO: "Inscrição",
  TRIAGEM: "Triagem",
  ENTREVISTA_RH: "Entrevista RH",
  TESTE_TECNICO: "Teste técnico",
  ENTREVISTA_TECNICA: "Entrevista técnica",
  PROPOSTA: "Proposta",
  CONTRATACAO: "Contratação",
}

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

export const STATUS_AGENDAMENTO_LABELS: Record<StatusAgendamento, string> = {
  PENDENTE: "Aguardando confirmação",
  CONFIRMADO: "Confirmado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
  REALIZADO: "Realizado",
  NAO_COMPARECEU: "Não compareceu",
}

export const STATUS_BADGE: Record<StatusCandidatura, "primary" | "success" | "danger" | "neutral"> = {
  EM_ANDAMENTO: "primary",
  APROVADA: "success",
  REPROVADA: "danger",
  CANCELADA: "neutral",
}

export const ETAPA_DOT: Record<EtapaProcesso, string> = {
  INSCRICAO: "bg-subtle-foreground",
  TRIAGEM: "bg-border-strong",
  ENTREVISTA_RH: "bg-info",
  TESTE_TECNICO: "bg-warning",
  ENTREVISTA_TECNICA: "bg-primary",
  PROPOSTA: "bg-success",
  CONTRATACAO: "bg-success",
}

export function etapasDaVaga(etapasVaga?: EtapaFluxo[]): EtapaProcesso[] {
  return [...(etapasVaga ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map(item => item.etapa)
    .filter((etapa, index, etapas) => Boolean(etapa) && etapas.indexOf(etapa) === index)
}

export function etapaIndex(etapa: EtapaProcesso, etapasVaga?: EtapaFluxo[]): number {
  return etapasDaVaga(etapasVaga).indexOf(etapa)
}

export function isEtapaDepoisDe(etapa: EtapaProcesso, referencia: EtapaProcesso, etapasVaga?: EtapaFluxo[]): boolean {
  const index = etapaIndex(etapa, etapasVaga)
  const referenceIndex = etapaIndex(referencia, etapasVaga)
  return index >= 0 && referenceIndex >= 0 && index > referenceIndex
}

export function etapasPosteriores(atual: EtapaProcesso, etapasVaga?: EtapaFluxo[]): EtapaProcesso[] {
  const index = etapaIndex(atual, etapasVaga)
  return index < 0 ? [] : etapasDaVaga(etapasVaga).slice(index + 1)
}

export function etapasAteAtual(atual: EtapaProcesso, etapasVaga?: EtapaFluxo[]): EtapaProcesso[] {
  return etapasDaVaga(etapasVaga).slice(0, etapaIndex(atual, etapasVaga) + 1)
}

export function isFinalizada(status: StatusCandidatura): boolean {
  return status !== "EM_ANDAMENTO"
}


export interface Candidatura {
  id: string
  vagaId: string
  vagaTitulo: string
  companyProfileId?: string
  nomeEmpresa?: string
  logoUrlEmpresa?: string
  candidatoNome?: string
  candidatoEmail?: string
  candidateProfileId?: string
  candidatoUserId?: string
  candidatoHeadline?: string
  candidatoImagemUrl?: string
  etapaAtual: EtapaProcesso
  etapaAtualDescricao?: string
  etapasVaga?: EtapaFluxo[]
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

export interface CandidaturaHistorico {
  id: string
  etapaAnteriorDescricao?: string
  etapaNovaDescricao?: string
  etapaAnterior?: EtapaProcesso
  etapaNova: EtapaProcesso
  statusAnterior?: StatusCandidatura
  statusNovo: StatusCandidatura
  /** Mensagem visível ao candidato. */
  observacao?: string
  /** Anotação da equipe. O backend só envia quando quem consulta é a empresa. */
  notaInterna?: string
  autorUserId?: string
  autorNome?: string
  createdAt?: string
}

export interface CandidaturaFeedback {
  etapaDescricao?: string
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

export interface CandidaturaDetalhe {
  candidatura: Candidatura
  historico: CandidaturaHistorico[]
  feedbacks: CandidaturaFeedback[]
  agendamentos: CandidaturaAgendamento[]
}

export interface CandidaturaAgendamento {
  id: string
  candidaturaId: string
  etapa: EtapaProcesso
  etapaDescricao?: string
  titulo: string
  mensagem?: string
  inicio: string
  duracaoMinutos: number
  link: string
  status: StatusAgendamento
  statusDescricao?: string
  criadoPorUserId?: string
  criadoPorNome?: string
  motivoCancelamento?: string
  createdAt?: string
  updatedAt?: string
}


/** Agendamento na listagem geral da empresa: reunião + candidato + vaga. */
export interface AgendamentoEmpresa {
  id: string
  candidaturaId: string
  candidaturaStatus: StatusCandidatura
  vagaId: string
  vagaTitulo: string
  candidatoUserId?: string
  candidatoNome: string
  candidatoEmail?: string
  candidatoHeadline?: string
  candidatoImagemUrl?: string
  etapa: EtapaProcesso
  etapaDescricao?: string
  titulo: string
  mensagem?: string
  inicio: string
  duracaoMinutos: number
  link: string
  status: StatusAgendamento
  statusDescricao?: string
  criadoPorUserId?: string
  criadoPorNome?: string
  motivoCancelamento?: string
  createdAt?: string
  updatedAt?: string
}

export interface AgendamentoEmpresaFilters {
  status?: StatusAgendamento
  /** Somente os agendamentos criados pelo usuário logado. */
  criadoPorMim?: boolean
  /** ISO-8601: início da janela (inclusivo). */
  de?: string
  /** ISO-8601: fim da janela (exclusivo). */
  ate?: string
}

export interface CreateCandidaturaDto {
  vagaId: string
  cartaApresentacao?: string
  curriculoUrl?: string
}

export interface AvancarEtapaDto {
  etapa: EtapaProcesso
  /** Mensagem ao candidato (histórico, notificação e e-mail). */
  observacao?: string
  /** Só a equipe da empresa vê. */
  notaInterna?: string
}

export interface DecidirCandidaturaDto {
  status: Extract<StatusCandidatura, "APROVADA" | "REPROVADA">
  /** Mensagem ao candidato (histórico, notificação e e-mail). */
  motivo?: string
  /** Só a equipe da empresa vê. */
  notaInterna?: string
}

export interface CreateFeedbackDto {
  etapa: EtapaProcesso
  titulo: string
  mensagem: string
  nota?: number
}

export interface CreateAgendamentoDto {
  etapa: EtapaProcesso
  titulo: string
  mensagem?: string
  inicio: string
  duracaoMinutos: number
  link: string
}

export interface CandidaturaFilters {
  vagaId?: string
  status?: StatusCandidatura
  etapa?: EtapaProcesso
  candidatoNome?: string
}
