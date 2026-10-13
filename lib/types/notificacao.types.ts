export const TIPOS_NOTIFICACAO = ["CANDIDATURA", "CHAT", "VAGAS"] as const

export type TipoNotificacao = (typeof TIPOS_NOTIFICACAO)[number]

export interface Notificacao {
  notificacaoId: string
  userId: string
  titulo: string
  descricao: string
  createdAt: string
  type: TipoNotificacao
  /** Nem todo endpoint devolve o campo; ausência é tratada como "não lida". */
  lida?: boolean
}

export interface NotificacoesResumo {
  notificacoes: Notificacao[]
  naoLidas: number
}

export const TIPO_NOTIFICACAO_LABELS: Record<TipoNotificacao, string> = {
  CANDIDATURA: "Candidaturas",
  CHAT: "Mensagens",
  VAGAS: "Vagas",
}

export function isNaoLida(notificacao: Notificacao) {
  return notificacao.lida !== true
}
