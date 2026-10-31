"use server"

import { apiFetch } from "@/lib/server/api"
import { fail, ok, type ActionResult } from "@/lib/actions/result"
import type { Candidatura, CandidaturaDetalhe } from "@/lib/types/candidatura.types"
import type { Chat, ChatMensagem, ChatPerspectiva } from "@/lib/types/chat.types"

const id = (value: string) => encodeURIComponent(value)

export async function getMensagensAction(
  candidaturaId: string,
): Promise<ActionResult<ChatMensagem[]>> {
  return apiFetch<ChatMensagem[]>(`/message/${id(candidaturaId)}`)
}

export async function enviarMensagemAction(
  candidaturaId: string,
  message: string,
): Promise<ActionResult<ChatMensagem>> {
  return apiFetch<ChatMensagem>(`/message/${id(candidaturaId)}`, {
    method: "POST",
    body: { message },
  })
}

export async function marcarMensagensLidasAction(
  candidaturaId: string,
): Promise<ActionResult<void>> {
  return apiFetch<void>(`/message/${id(candidaturaId)}/lidas`, {
    method: "PATCH",
    nullOn: [204],
  })
}

function montarChat(candidatura: Candidatura, mensagens: ChatMensagem[]): Chat {
  const ultima = mensagens.at(-1)
  return {
    candidaturaId: candidatura.id,
    vagaId: candidatura.vagaId,
    vagaTitulo: candidatura.vagaTitulo,
    empresaNome: candidatura.nomeEmpresa,
    empresaLogoUrl: candidatura.logoUrlEmpresa,
    candidatoNome: candidatura.candidatoNome,
    candidatoImagemUrl: candidatura.candidatoImagemUrl,
    iniciado: mensagens.length > 0,
    ultimaMensagem: ultima?.mensagem,
    ultimaMensagemEm: ultima?.enviadoEm,
    naoLidas: mensagens.filter((m) => !m.enviadoPorSiMesmo && !m.lida).length,
  }
}

export async function getConversasAction(
  perspectiva: ChatPerspectiva,
): Promise<ActionResult<Chat[]>> {
  const candidaturas = await apiFetch<Candidatura[]>(
    perspectiva === "empresa" ? "/empresa/candidaturas" : "/candidaturas/me",
  )
  if (!candidaturas.ok) return candidaturas

  const chats = await Promise.all(
    (candidaturas.data ?? []).map(async (candidatura) => {
      const mensagens = await getMensagensAction(candidatura.id)
      return mensagens.ok ? montarChat(candidatura, mensagens.data ?? []) : null
    }),
  )

  return ok(
    chats
      .filter((chat): chat is Chat => chat !== null && chat.iniciado)
      .sort((a, b) => (b.ultimaMensagemEm ?? "").localeCompare(a.ultimaMensagemEm ?? "")),
  )
}

export async function getConversaAction(
  candidaturaId: string,
  perspectiva: ChatPerspectiva,
): Promise<ActionResult<Chat>> {
  const [detalhe, mensagens] = await Promise.all([
    apiFetch<CandidaturaDetalhe>(
      perspectiva === "empresa"
        ? `/empresa/candidaturas/${id(candidaturaId)}`
        : `/candidaturas/${id(candidaturaId)}`,
    ),
    getMensagensAction(candidaturaId),
  ])
  if (!detalhe.ok) return detalhe
  if (!mensagens.ok) return mensagens
  if (!detalhe.data?.candidatura) return fail("Candidatura não encontrada.", 404)
  return ok(montarChat(detalhe.data.candidatura, mensagens.data ?? []))
}
