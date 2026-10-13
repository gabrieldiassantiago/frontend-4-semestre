"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Client } from "@stomp/stompjs"
import {
  enviarMensagemAction,
  getConversaAction,
  getConversasAction,
  getMensagensAction,
  marcarMensagensLidasAction,
} from "@/actions/chat"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { WS_URL } from "@/lib/http/config"
import { queryKeys } from "./keys"
import type { Chat, ChatLeitura, ChatMensagem, ChatPerspectiva } from "@/lib/types/chat.types"

export type ChatConexao = "conectando" | "online" | "offline"

export function useChats(perspectiva: ChatPerspectiva) {
  const query = useQuery({
    queryKey: [...queryKeys.chat.lista(), perspectiva],
    queryFn: async () => unwrap(await getConversasAction(perspectiva)),
  })
  const chats = query.data ?? []
  return {
    chats,
    naoLidas: chats.reduce((total, chat) => total + (chat.naoLidas ?? 0), 0),
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar as conversas.") : null,
    refetch: query.refetch,
  }
}

export function useChat(candidaturaId: string, perspectiva: ChatPerspectiva) {
  const query = useQuery({
    queryKey: [...queryKeys.chat.detalhe(candidaturaId), perspectiva],
    queryFn: async () => unwrap(await getConversaAction(candidaturaId, perspectiva)),
    enabled: Boolean(candidaturaId),
  })
  return {
    chat: (query.data ?? null) as Chat | null,
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar a conversa.") : null,
    refetch: query.refetch,
  }
}

export function useMensagens(candidaturaId: string, enabled = true) {
  const query = useQuery({
    queryKey: queryKeys.chat.mensagens(candidaturaId),
    queryFn: async () => unwrap(await getMensagensAction(candidaturaId)),
    enabled: Boolean(candidaturaId) && enabled,
  })

  const mensagens = query.data ?? []

  return {
    mensagens,
    naoLidas: mensagens.filter((item) => !item.enviadoPorSiMesmo && !item.lida).length,
    loading: enabled && query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar as mensagens.") : null,
    refetch: query.refetch,
  }
}

// ── Mutações ───────────────────────────────────────────────────────────────

export function useEnviarMensagem(candidaturaId: string) {
  const queryClient = useQueryClient()
  const key = queryKeys.chat.mensagens(candidaturaId)

  return useMutation({
    mutationFn: async (texto: string) => unwrap(await enviarMensagemAction(candidaturaId, texto)),
    // O backend só notifica o outro participante via WebSocket, então a
    // resposta do POST é a única cópia que o remetente recebe.
    onSuccess: (enviada) => {
      queryClient.setQueryData<ChatMensagem[]>(key, (atual = []) => [...atual, enviada])
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.lista() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.detalhe(candidaturaId) })
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: key })
    },
  })
}

export function useMarcarLidas(candidaturaId: string) {
  const queryClient = useQueryClient()
  const key = queryKeys.chat.mensagens(candidaturaId)

  return useMutation({
    mutationFn: async () => unwrap(await marcarMensagensLidasAction(candidaturaId)),
    onSuccess: () => {
      queryClient.setQueryData<ChatMensagem[]>(key, (atual = []) =>
        atual.map((item) => (item.enviadoPorSiMesmo ? item : { ...item, lida: true })),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.lista() })
    },
  })
}

// ── Tempo real (STOMP) ─────────────────────────────────────────────────────

/**
 * Conecta ao endpoint STOMP `/ws` do Spring. O handshake é autenticado pelo
 * cookie httpOnly `token` (ver `bearerTokenResolver` no SecurityConfig), então
 * nenhum header precisa ser enviado aqui.
 *
 * - `/user/queue/mensagens`: nova mensagem do outro participante. O payload não
 *   traz `candidaturaId`, então todas as consultas de chat são revalidadas.
 * - `/user/queue/leituras`: o outro participante leu minhas mensagens.
 */
export function useChatSocket(enabled = true): ChatConexao {
  const queryClient = useQueryClient()
  const [conexao, setConexao] = useState<ChatConexao>("conectando")

  useEffect(() => {
    if (!enabled) return

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    client.onConnect = () => {
      setConexao("online")

      client.subscribe("/user/queue/mensagens", () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all })
      })

      client.subscribe("/user/queue/leituras", (frame) => {
        try {
          const leitura = JSON.parse(frame.body) as ChatLeitura
          queryClient.setQueryData<ChatMensagem[]>(
            queryKeys.chat.mensagens(leitura.candidaturaId),
            (atual) => atual?.map((item) => (item.enviadoPorSiMesmo ? { ...item, lida: true } : item)),
          )
        } catch {
          void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all })
        }
      })
    }

    client.onWebSocketClose = () => setConexao("offline")
    client.onStompError = () => setConexao("offline")

    setConexao("conectando")
    client.activate()

    return () => {
      void client.deactivate()
    }
  }, [enabled, queryClient])

  return enabled ? conexao : "offline"
}
