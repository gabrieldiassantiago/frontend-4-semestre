"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutGroup, MotionConfig, motion } from "framer-motion"
import { Search, MessageSquareText } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { CardSkeleton, ErrorState } from "@/components/ui/states"
import { formatQuando } from "./chat-conversa"
import { chatContato, type Chat, type ChatPerspectiva } from "@/lib/types/chat.types"
import { cn } from "@/lib/utils"

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "nao-lidas", label: "Não lidas" },
] as const

type Filtro = (typeof FILTROS)[number]["id"]

interface ChatListProps {
  chats: Chat[]
  naoLidas: number
  loading: boolean
  error: string | null
  onRetry: () => void
  activeId: string | null
  perspectiva: ChatPerspectiva
  hrefFor: (candidaturaId: string) => string
  className?: string
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export function ChatList({ chats, naoLidas, loading, error, onRetry, activeId, perspectiva, hrefFor, className }: ChatListProps) {
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const termo = busca.trim().toLocaleLowerCase("pt-BR")

  const visiveis = chats
    .filter((chat) => {
      if (filtro === "nao-lidas" && !chat.naoLidas) return false
      if (!termo) return true
      return [chatContato(chat, perspectiva).nome, chat.vagaTitulo].some((texto) => texto?.toLocaleLowerCase("pt-BR").includes(termo))
    })
    .sort((a, b) => (b.ultimaMensagemEm ?? "").localeCompare(a.ultimaMensagemEm ?? ""))

  return (
    <MotionConfig reducedMotion="user">
      <aside aria-label="Conversas" className={cn("flex min-h-0 flex-col border-border bg-card", className)}>
        <div className="flex flex-col gap-3.5 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <span className="grid size-8 place-items-center rounded-lg bg-primary-subtle text-primary">
                <MessageSquareText aria-hidden className="size-4" />
              </span>
              Mensagens
            </h2>
            {naoLidas > 0 && (
              <motion.span
                key={naoLidas}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-[0_4px_12px_-4px_var(--primary)]"
              >
                {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
              </motion.span>
            )}
          </div>
          <label className="group relative block">
            <span className="sr-only">Buscar conversas</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground transition-colors group-focus-within:text-primary"
            />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder={perspectiva === "empresa" ? "Buscar candidato ou vaga" : "Buscar empresa ou vaga"}
              className="h-10 w-full rounded-xl border border-transparent bg-muted pl-9 pr-3 text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-subtle-foreground focus:border-primary focus:bg-card focus:shadow-[0_0_0_4px_var(--primary-ring)]"
            />
          </label>
          <LayoutGroup id="chat-filtros">
            <div role="group" aria-label="Filtrar conversas" className="flex gap-1 rounded-xl bg-muted p-1">
              {FILTROS.map((item) => {
                const ativo = filtro === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFiltro(item.id)}
                    className={cn(
                      "relative flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors duration-200",
                      ativo ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {ativo && (
                      <motion.span
                        layoutId="chat-filtro-ativo"
                        aria-hidden
                        className="absolute inset-0 rounded-lg bg-card shadow-card"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-1">
                      {item.label}
                      {item.id === "nao-lidas" && naoLidas > 0 && <span className="tabular-nums text-primary">{naoLidas}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {loading ? (
            <div className="p-2">
              <CardSkeleton rows={4} />
            </div>
          ) : error ? (
            <div className="p-2">
              <ErrorState
                description={error}
                action={
                  <button type="button" className="btn-secondary" onClick={onRetry}>
                    Tentar novamente
                  </button>
                }
              />
            </div>
          ) : visiveis.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {chats.length === 0 ? "Nenhuma conversa ainda." : "Nenhuma conversa encontrada."}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {visiveis.map((chat, index) => (
                <motion.li
                  key={chat.candidaturaId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: EASE_OUT }}
                >
                  <ChatListItem
                    chat={chat}
                    perspectiva={perspectiva}
                    active={chat.candidaturaId === activeId}
                    href={hrefFor(chat.candidaturaId)}
                  />
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </MotionConfig>
  )
}

function ChatListItem({ chat, perspectiva, active, href }: { chat: Chat; perspectiva: ChatPerspectiva; active: boolean; href: string }) {
  const contato = chatContato(chat, perspectiva)
  const naoLidas = chat.naoLidas ?? 0
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-[background-color,transform] duration-200 active:scale-[0.98]",
        active ? "bg-primary-subtle" : "hover:-translate-y-px hover:bg-muted",
      )}
    >
      {active && (
        <motion.span
          layoutId="chat-ativo-indicador"
          aria-hidden
          className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative shrink-0">
        <EntityAvatar
          name={contato.nome}
          src={contato.imagemUrl}
          size="md"
          className={cn("rounded-full transition-shadow duration-200", active ? "ring-2 ring-primary/30" : "group-hover:ring-2 group-hover:ring-border")}
        />
        {naoLidas > 0 && (
          <span aria-hidden className="absolute right-0 top-0 size-3 rounded-full bg-primary ring-2 ring-card motion-safe:animate-pulse" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm text-foreground", naoLidas ? "font-bold" : "font-semibold")}>{contato.nome}</span>
          <span className={cn("shrink-0 text-[11px]", naoLidas ? "font-semibold text-primary" : "text-subtle-foreground")}>
            {formatQuando(chat.ultimaMensagemEm)}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-wide text-subtle-foreground">{chat.vagaTitulo}</span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", naoLidas ? "font-medium text-foreground" : "text-muted-foreground")}>
            {chat.ultimaMensagem || "Conversa iniciada"}
          </span>
          {naoLidas > 0 && (
            <motion.span
              key={naoLidas}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className="grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground shadow-[0_4px_10px_-4px_var(--primary)]"
            >
              {naoLidas > 99 ? "99+" : naoLidas}
              <span className="sr-only"> mensagens não lidas</span>
            </motion.span>
          )}
        </span>
      </span>
    </Link>
  )
}
