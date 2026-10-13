"use client"

import Link from "next/link"
import { ArrowLeft, ArrowUpRight, MessageSquare } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { CardSkeleton, ErrorState } from "@/components/ui/states"
import { ChatList } from "./chat-list"
import { ChatConversa, StatusConexao } from "./chat-conversa"
import { useChat, useChatSocket, useChats, type ChatConexao } from "@/lib/queries/use-chat"
import { ROUTES } from "@/lib/config/routes"
import { chatContato, type Chat, type ChatPerspectiva } from "@/lib/types/chat.types"
import { cn } from "@/lib/utils"

interface MessagesScreenProps {
  perspectiva: ChatPerspectiva
  activeId: string | null
}

const ROTAS = {
  candidato: {
    lista: ROUTES.candidate.messages,
    chat: ROUTES.candidate.chat,
    candidatura: ROUTES.candidate.application,
    candidaturaLabel: "Ver candidatura",
  },
  empresa: {
    lista: ROUTES.company.messages,
    chat: ROUTES.company.chat,
    candidatura: ROUTES.company.candidate,
    candidaturaLabel: "Ver candidato",
  },
} as const

export function MessagesScreen({ perspectiva, activeId }: MessagesScreenProps) {
  const rotas = ROTAS[perspectiva]
  const { chats, naoLidas, loading, error, refetch } = useChats(perspectiva)
  const conexao = useChatSocket()

  return (
    <main className="mx-auto w-full max-w-[1280px] lg:px-8 lg:py-6">
      <h1 className="sr-only">Mensagens</h1>
      <div className="flex h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] overflow-hidden border-border bg-card lg:h-[calc(100dvh-7rem)] lg:rounded-card lg:border lg:shadow-card">
        <ChatList
          chats={chats}
          naoLidas={naoLidas}
          loading={loading}
          error={error}
          onRetry={() => void refetch()}
          activeId={activeId}
          perspectiva={perspectiva}
          hrefFor={rotas.chat}
          className={cn("w-full shrink-0 lg:flex lg:w-[340px] lg:border-r", activeId ? "hidden" : "flex")}
        />
        {activeId ? (
          <ConversaAtiva key={activeId} candidaturaId={activeId} perspectiva={perspectiva} conexao={conexao} />
        ) : (
          <SemConversa perspectiva={perspectiva} temChats={chats.length > 0} />
        )}
      </div>
    </main>
  )
}

function ConversaAtiva({ candidaturaId, perspectiva, conexao }: { candidaturaId: string; perspectiva: ChatPerspectiva; conexao: ChatConexao }) {
  const rotas = ROTAS[perspectiva]
  const { chat, loading, error, refetch } = useChat(candidaturaId, perspectiva)

  if (loading) {
    return (
      <section aria-busy className="flex flex-1 flex-col bg-card p-6">
        <CardSkeleton rows={4} />
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center bg-card p-6">
        <ErrorState description={error} action={<button type="button" className="btn-secondary" onClick={() => void refetch()}>Tentar novamente</button>} />
      </section>
    )
  }

  const contatoNome = chat ? chatContato(chat, perspectiva).nome : perspectiva === "empresa" ? "o candidato" : "a empresa"

  return (
    <section aria-label={`Conversa com ${contatoNome}`} className="flex min-h-0 min-w-0 flex-1 flex-col bg-card">
      <ConversaHeader chat={chat} perspectiva={perspectiva} contatoNome={contatoNome} conexao={conexao} voltarHref={rotas.lista}>
        <Link href={rotas.candidatura(candidaturaId)} className="btn-secondary hidden min-h-10 md:inline-flex">
          {rotas.candidaturaLabel}
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </ConversaHeader>
      <ChatConversa candidaturaId={candidaturaId} perspectiva={perspectiva} contatoNome={contatoNome} />
    </section>
  )
}

function ConversaHeader({
  chat,
  perspectiva,
  contatoNome,
  conexao,
  voltarHref,
  children,
}: {
  chat: Chat | null
  perspectiva: ChatPerspectiva
  contatoNome: string
  conexao: ChatConexao
  voltarHref: string
  children: React.ReactNode
}) {
  return (
    <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 sm:px-6">
      <Link
        href={voltarHref}
        aria-label="Voltar para conversas"
        className="grid size-10 shrink-0 place-items-center rounded-lg text-strong-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <ArrowLeft aria-hidden className="size-5" />
      </Link>
      <EntityAvatar name={contatoNome} src={chat ? chatContato(chat, perspectiva).imagemUrl : null} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{chat ? contatoNome : "Chat da candidatura"}</p>
        {chat?.vagaTitulo && <p className="mt-0.5 truncate text-xs text-muted-foreground">Sobre a vaga {chat.vagaTitulo}</p>}
      </div>
      <StatusConexao conexao={conexao} />
      {children}
    </header>
  )
}

function SemConversa({ perspectiva, temChats }: { perspectiva: ChatPerspectiva; temChats: boolean }) {
  const descricao = temChats
    ? "Selecione uma conversa ao lado para ver o histórico."
    : perspectiva === "empresa"
      ? "Abra a página de um candidato e clique em Iniciar chat para começar uma conversa."
      : "Quando uma empresa iniciar uma conversa sobre sua candidatura, ela aparecerá aqui."

  return (
    <section className="hidden flex-1 flex-col items-center justify-center bg-surface p-8 text-center lg:flex">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-subtle text-primary-subtle-foreground">
        <MessageSquare className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-base font-semibold text-foreground">{temChats ? "Suas conversas" : "Nenhuma conversa ainda"}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{descricao}</p>
      {!temChats && perspectiva === "empresa" && (
        <Link href={ROUTES.company.candidates} className="btn-secondary mt-5">Ver candidatos</Link>
      )}
    </section>
  )
}
