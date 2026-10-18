"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
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
    <aside aria-label="Conversas" className={cn("flex min-h-0 flex-col border-border bg-card", className)}>
      <div className="flex flex-col gap-3 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Mensagens</h2>
          {naoLidas > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
            </span>
          )}
        </div>
        <label className="relative block">
          <span className="sr-only">Buscar conversas</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder={perspectiva === "empresa" ? "Buscar candidato ou vaga" : "Buscar empresa ou vaga"}
            className="h-10 w-full rounded-lg border border-transparent bg-muted pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-subtle-foreground focus:border-primary focus:bg-card"
          />
        </label>
        <div role="group" aria-label="Filtrar conversas" className="flex gap-1 border-b border-border-subtle">
          {FILTROS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filtro === item.id}
              onClick={() => setFiltro(item.id)}
              className={cn(
                "-mb-px border-b-2 px-2 pb-2 text-xs font-semibold transition-colors",
                filtro === item.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {item.id === "nao-lidas" && naoLidas > 0 && <span className="ml-1 tabular-nums text-primary">{naoLidas}</span>}
            </button>
          ))}
        </div>
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
          <ul className="flex flex-col gap-0.5">
            {visiveis.map((chat) => (
              <li key={chat.candidaturaId}>
                <ChatListItem chat={chat} perspectiva={perspectiva} active={chat.candidaturaId === activeId} href={hrefFor(chat.candidaturaId)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
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
        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-primary-subtle" : "hover:bg-muted",
      )}
    >
      <span className="relative shrink-0">
        <EntityAvatar name={contato.nome} src={contato.imagemUrl} size="md" className="rounded-full" />
        {naoLidas > 0 && <span aria-hidden className="absolute right-0 top-0 size-3 rounded-full bg-primary ring-2 ring-card" />}
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
            <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground">
              {naoLidas > 99 ? "99+" : naoLidas}
              <span className="sr-only"> mensagens não lidas</span>
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
