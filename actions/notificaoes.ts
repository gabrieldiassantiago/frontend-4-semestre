"use server"

import { apiFetch } from "@/lib/server/api"
import { fail, ok, type ActionResult } from "@/lib/actions/result"

export type Notificacao = {
  notificacaoId: string
  userId: string
  titulo: string
  descricao: string
  createdAt: string
  type: "CANDIDATURA" | "CHAT" | "VAGAS"
}

export async function listarNotificacoesAction(): Promise<
  ActionResult<Notificacao[]>
> {
  return apiFetch<Notificacao[]>("/notificacoes")
}

export async function contarNaoLidasAction(): Promise<ActionResult<number>> {
  return apiFetch<number>("/notificacoes/unreads")
}

export async function marcarComoLidaAction(
  notificacaoId: string
): Promise<ActionResult<void>> {
  return apiFetch<void>(`/notificacoes/${notificacaoId}`, {
    method: "PATCH",
  })
}

export async function marcarTodasComoLidasAction(): Promise<
  ActionResult<void>
> {
  return apiFetch<void>("/notificacoes", {
    method: "PATCH",
  })
}

export async function notificarAction(): Promise<
  ActionResult<{ notificacoes: Notificacao[]; naoLidas: number }>
> {
  const [notificacoes, naoLidas] = await Promise.all([
    listarNotificacoesAction(),
    contarNaoLidasAction(),
  ])

  if (!notificacoes.ok) return fail(notificacoes.error, notificacoes.status)
  if (!naoLidas.ok) return fail(naoLidas.error, naoLidas.status)

  return ok({
    notificacoes: notificacoes.data ?? [],
    naoLidas: naoLidas.data ?? 0,
  })
}