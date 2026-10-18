"use server"

import { apiFetch } from "@/lib/server/api"
import { ok, type ActionResult } from "@/lib/actions/result"
import type { Notificacao, NotificacoesResumo } from "@/lib/types/notificacao.types"

const id = (value: string) => encodeURIComponent(value)

export async function listarNotificacoesAction(): Promise<ActionResult<Notificacao[]>> {
  return apiFetch<Notificacao[]>("/notificacoes")
}

export async function contarNaoLidasAction(): Promise<ActionResult<number>> {
  return apiFetch<number>("/notificacoes/unreads")
}

export async function marcarNotificacaoLidaAction(notificacaoId: string): Promise<ActionResult<void>> {
  return apiFetch<void>(`/notificacoes/${id(notificacaoId)}`, {
    method: "PATCH",
    nullOn: [204],
  })
}

export async function marcarTodasNotificacoesLidasAction(): Promise<ActionResult<void>> {
  return apiFetch<void>("/notificacoes", {
    method: "PATCH",
    nullOn: [204],
  })
}

/** Lista + contador em uma única ida ao servidor (alimenta o sino e a tela). */
export async function getNotificacoesResumoAction(): Promise<ActionResult<NotificacoesResumo>> {
  const [notificacoes, naoLidas] = await Promise.all([listarNotificacoesAction(), contarNaoLidasAction()])

  if (!notificacoes.ok) return notificacoes
  if (!naoLidas.ok) return naoLidas
  

  const lista = [...(notificacoes.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return ok({ notificacoes: lista, naoLidas: naoLidas.data ?? 0 })
}
