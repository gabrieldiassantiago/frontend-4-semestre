/**
 * Conversa vinculada a uma candidatura. A API não tem entidade "chat": a conversa
 * começa quando a empresa envia a primeira mensagem (`POST /message/{candidaturaId}`).
 * Este objeto é montado no front a partir da candidatura + histórico de mensagens.
 */
export interface Chat {
  candidaturaId: string
  vagaId?: string
  vagaTitulo: string
  empresaNome?: string
  empresaLogoUrl?: string
  candidatoNome?: string
  candidatoImagemUrl?: string
  /** `true` quando já existe ao menos uma mensagem. */
  iniciado: boolean
  ultimaMensagem?: string
  ultimaMensagemEm?: string
  naoLidas?: number
}

/** Espelha `HistoricoMessageResponseDto` da API. */
export interface ChatMensagem {
  remetente: string
  mensagem: string
  enviadoPorSiMesmo: boolean
  enviadoEm: string
  lida: boolean
}

/** Espelha `MensagemLidaDto` da API (enviado em `/user/queue/leituras`). */
export interface ChatLeitura {
  candidaturaId: string
  lidaEm: string
}

/** Quem está vendo o chat: define o nome do contato exibido e se pode iniciar conversas. */
export type ChatPerspectiva = "candidato" | "empresa"

/** Limite do `CreateMessageDto` (`@Size(max = 300)`). */
export const CHAT_MAX_CARACTERES = 300

export function chatContato(chat: Chat, perspectiva: ChatPerspectiva) {
  return perspectiva === "empresa"
    ? { nome: chat.candidatoNome || "Candidato", imagemUrl: chat.candidatoImagemUrl }
    : { nome: chat.empresaNome || "Empresa", imagemUrl: chat.empresaLogoUrl }
}
