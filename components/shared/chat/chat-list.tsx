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

  const visiveis = chats.filter((chat) => {
    if (filtro === "nao-lidas" && !chat.naoLidas) return false
    if (!termo) return true
    return [chatContato(chat, perspectiva).nome, chat.vagaTitulo].some((texto) => texto?.toLocaleLowerCase("pt-BR").includes(termo))
  })

  return (
    <aside aria-label="Conversas" className={cn("flex min-h-0 flex-col border-border bg-card", className)}>
      <div className="flex flex-col gap-3 border-b border-border-subtle p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Conversas</h2>
          {naoLidas > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {naoLidas} {naoLidas === 1 ? "não lida" : "não lidas"}
            </span>
          )}
        </div>
        <label className="relative block">
          <span className="sr-only">Buscar conversas</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder={perspectiva === "empresa" ? "Buscar candidato ou vaga" : "Buscar empresa ou vaga"}
            className="field-input min-h-11 pl-10"
          />
        </label>
        <div role="group" aria-label="Filtrar conversas" className="flex gap-1.5">
          {FILTROS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filtro === item.id}
              onClick={() => setFiltro(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filtro === item.id ? "bg-primary-subtle text-primary-subtle-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-2"><CardSkeleton rows={4} /></div>
        ) : error ? (
          <div className="p-2">
            <ErrorState description={error} action={<button type="button" className="btn-secondary" onClick={onRetry}>Tentar novamente</button>} />
          </div>
        ) : visiveis.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {chats.length === 0 ? "Nenhuma conversa ainda." : "Nenhuma conversa encontrada."}
          </p>
        ) : (
          <ul>
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
      className={cn("flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors", active ? "bg-primary-subtle" : "hover:bg-muted")}
    >
      <EntityAvatar name={contato.nome} src={contato.imagemUrl} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{contato.nome}</span>
          <span className={cn("shrink-0 text-[11px]", naoLidas ? "font-semibold text-primary" : "text-subtle-foreground")}>
            {formatQuando(chat.ultimaMensagemEm)}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">{chat.vagaTitulo}</span>
        <span className="mt-1.5 flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", naoLidas ? "font-medium text-strong-foreground" : "text-muted-foreground")}>
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
