"use client"

import { etapaLabel } from "@/lib/types/candidatura.types"


import Link from "next/link"
import { motion, MotionConfig } from "framer-motion"
import { ArrowLeft, ArrowUpRight, Briefcase, MessageSquare, Sparkles, Workflow } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { CardSkeleton, ErrorState } from "@/components/ui/states"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ChatList } from "./chat-list"
import { ChatConversa, StatusConexao } from "./chat-conversa"
import { useChat, useChatSocket, useChats, type ChatConexao } from "@/lib/queries/use-chat"
import { useCandidaturaEmpresa } from "@/lib/queries/use-candidaturas"
import { ROUTES } from "@/lib/config/routes"
import { formatDate } from "@/lib/format"
import { etapasDaVaga } from "@/lib/types/candidatura.types"
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
    <MotionConfig reducedMotion="user">
      <main className="mx-auto w-full max-w-[1480px] lg:px-6 lg:py-6">
        <h1 className="sr-only">Mensagens</h1>
        <div className="chat-workspace flex h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] overflow-hidden border-border bg-card lg:h-[calc(100dvh-7rem)] lg:rounded-2xl lg:border lg:shadow-raised">
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
    </MotionConfig>
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
        <ErrorState
          description={error}
          action={
            <button type="button" className="btn-secondary" onClick={() => void refetch()}>
              Tentar novamente
            </button>
          }
        />
      </section>
    )
  }

  const contato = chat ? chatContato(chat, perspectiva) : null
  const contatoNome = contato?.nome ?? (perspectiva === "empresa" ? "o candidato" : "a empresa")

  return (
    <>
      <motion.section
        aria-label={`Conversa com ${contatoNome}`}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-0 min-w-0 flex-1 flex-col bg-card"
      >
        <header className="flex items-center gap-3 border-b border-border-subtle bg-card/90 px-4 py-3 backdrop-blur sm:px-5">
          <Link
            href={rotas.lista}
            aria-label="Voltar para conversas"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-strong-foreground transition-colors hover:bg-muted lg:hidden"
          >
            <ArrowLeft aria-hidden className="size-5" />
          </Link>
          <EntityAvatar name={contatoNome} src={contato?.imagemUrl} size="md" className="rounded-full ring-2 ring-primary-subtle" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">{chat ? contatoNome : "Chat da candidatura"}</p>
            {chat?.vagaTitulo && (
              <p className="mt-1 flex w-fit max-w-full items-center gap-1 truncate rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-subtle-foreground">
                <Briefcase aria-hidden className="size-3 shrink-0" />
                <span className="truncate">{chat.vagaTitulo}</span>
              </p>
            )}
          </div>
          <StatusConexao conexao={conexao} />
          <Link href={rotas.candidatura(candidaturaId)} className="btn-secondary hidden min-h-9 px-3 text-xs md:inline-flex xl:hidden">
            {rotas.candidaturaLabel}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </header>
        <ChatConversa
          candidaturaId={candidaturaId}
          perspectiva={perspectiva}
          contatoNome={contatoNome}
          contatoImagemUrl={contato?.imagemUrl}
        />
      </motion.section>
      <ContextoConversa chat={chat} candidaturaId={candidaturaId} perspectiva={perspectiva} />
    </>
  )
}

/** Painel lateral (telas largas) com o contexto da candidatura ligada à conversa. */
function ContextoConversa({ chat, candidaturaId, perspectiva }: { chat: Chat | null; candidaturaId: string; perspectiva: ChatPerspectiva }) {
  const rotas = ROTAS[perspectiva]
  const { detalhe } = useCandidaturaEmpresa(perspectiva === "empresa" ? candidaturaId : null)
  const candidatura = detalhe?.candidatura
  const contato = chat ? chatContato(chat, perspectiva) : null
  const flow = candidatura ? etapasDaVaga(candidatura.etapasVaga) : []
  const current = candidatura ? flow.indexOf(candidatura.etapaAtual) : -1

  return (
    <motion.aside
      aria-label="Detalhes da candidatura"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border-subtle bg-gradient-to-b from-primary-subtle/50 via-card to-card xl:flex"
    >
      <div className="flex flex-col items-center border-b border-border-subtle px-5 py-6 text-center">
        <EntityAvatar name={contato?.nome} src={contato?.imagemUrl} size="lg" className="size-16 rounded-full text-lg" />
        <p className="mt-3 text-sm font-semibold text-foreground">{contato?.nome}</p>
        {candidatura?.candidatoHeadline && <p className="mt-0.5 text-xs text-muted-foreground">{candidatura.candidatoHeadline}</p>}
        {candidatura && (
          <div className="mt-3">
            <StatusBadge status={candidatura.status} size="sm" />
          </div>
        )}
      </div>

      <dl className="flex flex-col gap-4 px-5 py-5 text-sm">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Vaga</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{chat?.vagaTitulo ?? candidatura?.vagaTitulo}</dd>
        </div>
        {candidatura && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Etapa atual</dt>
            <dd className="mt-1">
              <span className="font-semibold text-foreground">{etapaLabel(candidatura.etapaAtual, candidatura.etapasVaga, candidatura.etapaAtualDescricao)}</span>
              <span className="ml-1 text-xs text-subtle-foreground">
                {current + 1} de {flow.length}
              </span>
              <span className="mt-2 flex gap-0.5" aria-hidden>
                {flow.map((etapa, index) => (
                  <span key={etapa} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: index <= current ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="block h-full origin-left rounded-full bg-gradient-to-r from-primary to-primary-soft"
                    />
                  </span>
                ))}
              </span>
            </dd>
          </div>
        )}
        {candidatura?.createdAt && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Inscrição</dt>
            <dd className="mt-0.5 text-foreground">{formatDate(candidatura.createdAt)}</dd>
          </div>
        )}
        {candidatura?.candidatoEmail && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">E-mail</dt>
            <dd className="mt-0.5 truncate">
              <a href={`mailto:${candidatura.candidatoEmail}`} className="text-foreground hover:text-primary">
                {candidatura.candidatoEmail}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex flex-col gap-2 border-t border-border-subtle p-4">
        <Link href={rotas.candidatura(candidaturaId)} className="btn-secondary w-full transition-transform active:scale-[0.98]">
          {rotas.candidaturaLabel}
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
        {perspectiva === "empresa" && (chat?.vagaId ?? candidatura?.vagaId) && (
          <Link
            href={`${ROUTES.company.processes}?vaga=${encodeURIComponent((chat?.vagaId ?? candidatura?.vagaId) as string)}`}
            className="btn-ghost w-full transition-transform active:scale-[0.98]"
          >
            <Workflow aria-hidden className="size-4" />
            Abrir funil da vaga
          </Link>
        )}
      </div>
    </motion.aside>
  )
}

function SemConversa({ perspectiva, temChats }: { perspectiva: ChatPerspectiva; temChats: boolean }) {
  const descricao = temChats
    ? "Selecione uma conversa ao lado para ver o histórico."
    : perspectiva === "empresa"
      ? "Abra a página de um candidato e clique em Iniciar chat para começar uma conversa."
      : "Quando uma empresa iniciar uma conversa sobre sua candidatura, ela aparecerá aqui."

  return (
    <section className="chat-canvas hidden flex-1 flex-col items-center justify-center p-8 text-center lg:flex">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <span className="relative grid size-20 place-items-center">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-3xl bg-primary/15"
            animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="chat-float relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-[0_12px_30px_-10px_var(--primary)]">
            <MessageSquare className="size-7" aria-hidden />
          </span>
          <Sparkles aria-hidden className="absolute -right-1 -top-1 size-5 text-mint-strong" />
        </span>
        <p className="mt-6 text-lg font-semibold tracking-tight text-foreground">
          {temChats ? "Selecione uma conversa" : "Nenhuma conversa ainda"}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{descricao}</p>
        {!temChats && perspectiva === "empresa" && (
          <Link href={ROUTES.company.candidates} className="btn-secondary mt-6 transition-transform hover:-translate-y-0.5">
            Ver candidatos
          </Link>
        )}
      </motion.div>
    </section>
  )
}
