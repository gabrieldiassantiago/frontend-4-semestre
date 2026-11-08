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
import { getClientTokenAction } from "@/actions/auth"

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

export function useEnviarMensagem(candidaturaId: string) {
  const queryClient = useQueryClient()
  const key = queryKeys.chat.mensagens(candidaturaId)

  return useMutation({
    mutationFn: async (texto: string) => unwrap(await enviarMensagemAction(candidaturaId, texto)),
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

export function useChatSocket(enabled = true): ChatConexao {
  const queryClient = useQueryClient()
  const [conexao, setConexao] = useState<ChatConexao>("conectando")

  useEffect(() => {
    if (!enabled) return

    let active = true
    let client: Client | null = null

    async function connect() {

      const token = await getClientTokenAction()

      if (!active || !token) {
        if (active) setConexao("offline")
        return
      }

      client = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      })

      client.onConnect = () => {
        if (!active) return
        setConexao("online")

        client?.subscribe("/user/queue/mensagens", () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all })
        })

        client?.subscribe("/user/queue/leituras", (frame) => {
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

      client.onWebSocketClose = () => {
        if (active) setConexao("offline")
      }
      client.onStompError = () => {
        if (active) setConexao("offline")
      }

      setConexao("conectando")
      client.activate()
    }

    void connect()

    return () => {
      active = false
      void client?.deactivate()
    }
  }, [enabled, queryClient])

  return enabled ? conexao : "offline"
}
