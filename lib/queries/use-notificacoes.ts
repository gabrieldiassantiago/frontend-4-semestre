"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getNotificacoesResumoAction,
  marcarNotificacaoLidaAction,
  marcarTodasNotificacoesLidasAction,
} from "@/actions/notificacoes"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { isNaoLida, type NotificacoesResumo } from "@/lib/types/notificacao.types"
import { queryKeys } from "./keys"

export const NOTIFICACOES_REFRESH_MS = 15_000

/**
 * Sino da topbar, tela de notificações e visão geral leem a mesma consulta,
 * então o polling acontece uma única vez por aba.
 */
export function useNotificacoes() {
  const query = useQuery({
    queryKey: queryKeys.notificacoes.resumo(),
    queryFn: async () => unwrap(await getNotificacoesResumoAction()),
    refetchInterval: NOTIFICACOES_REFRESH_MS,
    refetchOnWindowFocus: true,
  })

  return {
    notificacoes: query.data?.notificacoes ?? [],
    naoLidas: query.data?.naoLidas ?? 0,
    loading: query.isPending,
    refreshing: query.isFetching && !query.isPending,
    error: query.error ? getErrorMessage(query.error, "Não foi possível carregar as notificações.") : null,
    refetch: query.refetch,
  }
}

// ── Mutações (otimistas: o sino responde na hora) ─────────────────────────

function useResumoOtimista() {
  const queryClient = useQueryClient()
  const key = queryKeys.notificacoes.resumo()

  const aplicar = async (atualizar: (atual: NotificacoesResumo) => NotificacoesResumo) => {
    await queryClient.cancelQueries({ queryKey: key })
    const anterior = queryClient.getQueryData<NotificacoesResumo>(key)
    if (anterior) queryClient.setQueryData<NotificacoesResumo>(key, atualizar(anterior))
    return { anterior }
  }

  const reverter = (contexto?: { anterior?: NotificacoesResumo }) => {
    if (contexto?.anterior) queryClient.setQueryData(key, contexto.anterior)
  }

  const revalidar = () => queryClient.invalidateQueries({ queryKey: queryKeys.notificacoes.all })

  return { aplicar, reverter, revalidar }
}

export function useMarcarNotificacaoLida() {
  const { aplicar, reverter, revalidar } = useResumoOtimista()

  return useMutation({
    mutationFn: async (notificacaoId: string) => unwrap(await marcarNotificacaoLidaAction(notificacaoId)),
    onMutate: (notificacaoId) =>
      aplicar((atual) => {
        const alvo = atual.notificacoes.find((n) => n.notificacaoId === notificacaoId)
        const eraNaoLida = alvo ? isNaoLida(alvo) : false
        return {
          notificacoes: atual.notificacoes.map((n) => (n.notificacaoId === notificacaoId ? { ...n, lida: true } : n)),
          naoLidas: eraNaoLida ? Math.max(0, atual.naoLidas - 1) : atual.naoLidas,
        }
      }),
    onError: (_error, _id, contexto) => reverter(contexto),
    onSettled: () => void revalidar(),
  })
}

export function useMarcarTodasNotificacoesLidas() {
  const { aplicar, reverter, revalidar } = useResumoOtimista()

  return useMutation({
    mutationFn: async () => unwrap(await marcarTodasNotificacoesLidasAction()),
    onMutate: () =>
      aplicar((atual) => ({
        notificacoes: atual.notificacoes.map((n) => ({ ...n, lida: true })),
        naoLidas: 0,
      })),
    onSuccess: () => toastSuccess("Todas as notificações foram marcadas como lidas."),
    onError: (_error, _vars, contexto) => reverter(contexto),
    onSettled: () => void revalidar(),
  })
}
