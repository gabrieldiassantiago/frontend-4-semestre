"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  LoaderCircle,
  MessageCircle,
  MessageSquarePlus,
} from "lucide-react"

import { Sheet } from "@/components/ui/sheet"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ChatConversa } from "./chat-conversa"
import {
  useChatSocket,
  useMensagens,
} from "@/lib/queries/use-chat"
import { ROUTES } from "@/lib/config/routes"
import type { ChatPerspectiva } from "@/lib/types/chat.types"
import { cn } from "@/lib/utils"

interface CandidaturaChatProps {
  candidaturaId: string
  contatoNome: string
  contatoImagemUrl?: string | null
  perspectiva: ChatPerspectiva
  assunto?: string
  className?: string
}

export function CandidaturaChatButton({
  candidaturaId,
  contatoNome,
  contatoImagemUrl,
  perspectiva,
  assunto,
  className,
}: CandidaturaChatProps) {
  const [aberto, setAberto] = useState(false)

  const {
    mensagens,
    loading,
    naoLidas,
    error,
    refetch,
  } = useMensagens(candidaturaId)

  const conexao = useChatSocket(aberto)

  const temMensagens = mensagens.length > 0
  const podeIniciar =
    perspectiva === "empresa" && !temMensagens

  const rotaMensagens =
    perspectiva === "empresa"
      ? ROUTES.company.chat(candidaturaId)
      : ROUTES.candidate.chat(candidaturaId)

  const rotulo = podeIniciar ? "Iniciar chat" : "Chat"

  const Icone = loading
    ? LoaderCircle
    : podeIniciar
      ? MessageSquarePlus
      : MessageCircle

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        disabled={loading && !aberto}
        aria-label={
          naoLidas > 0
            ? `Abrir chat com ${contatoNome}, ${naoLidas} mensagens não lidas`
            : `${rotulo} com ${contatoNome}`
        }
        className={cn(
          "btn-secondary relative shrink-0",
          className,
        )}
      >
        <Icone
          className={cn(
            "size-4",
            loading && "animate-spin",
          )}
          aria-hidden
        />

        <span>{rotulo}</span>

        {naoLidas > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground tabular-nums">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      <Sheet
        open={aberto}
        onClose={() => setAberto(false)}
        side="right"
        title={`Chat com ${contatoNome}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3">
            <EntityAvatar
              name={contatoNome}
              src={contatoImagemUrl}
              size="sm"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {contatoNome}
              </p>

              {assunto && (
                <p className="truncate text-xs text-muted-foreground">
                  {assunto}
                </p>
              )}
            </div>

            <span
              className={cn(
                "text-xs",
                conexao === "online"
                  ? "text-green-600"
                  : "text-muted-foreground",
              )}
            >
              {conexao === "online"
                ? "Online"
                : conexao === "offline"
                  ? "Offline"
                  : "Conectando"}
            </span>
          </div>

          {error ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5 text-center">
              <p className="text-sm text-destructive">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="btn-secondary"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ChatConversa
              candidaturaId={candidaturaId}
              perspectiva={perspectiva}
              contatoNome={contatoNome}
            />
          )}

          {temMensagens && (
            <Link
              href={rotaMensagens}
              className="flex items-center justify-center gap-1.5 border-t border-border-subtle py-2.5 text-xs font-semibold text-primary hover:bg-muted"
            >
              Abrir em Mensagens
              <ArrowUpRight
                className="size-3.5"
                aria-hidden
              />
            </Link>
          )}
        </div>
      </Sheet>
    </>
  )
}
