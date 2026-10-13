import { Search } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { cn } from "@/lib/utils"
import type { Conversation } from "./messages-data"

const FILTERS = ["Todas", "Não lidas", "Arquivadas"]

export function ConversationList({
  conversations,
  activeId,
  className,
}: {
  conversations: Conversation[]
  activeId: string
  className?: string
}) {
  return (
    <aside aria-label="Conversas" className={cn("flex min-h-0 flex-col border-border bg-card", className)}>
      <div className="flex flex-col gap-3 border-b border-border-subtle p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Conversas</h2>
          <span className="text-xs font-medium text-muted-foreground">3 não lidas</span>
        </div>
        <label className="relative block">
          <span className="sr-only">Buscar conversas</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
          />
          <input type="search" placeholder="Buscar empresa ou vaga" className="field-input min-h-11 pl-10" />
        </label>
        <div role="tablist" aria-label="Filtrar conversas" className="flex gap-1.5">
          {FILTERS.map((filter, index) => (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={index === 0}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                index === 0
                  ? "bg-primary-subtle text-primary-subtle-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => {
          const active = conversation.id === activeId
          const unread = conversation.unread > 0
          return (
            <li key={conversation.id}>
              <button
                type="button"
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
                  active ? "bg-primary-subtle" : "hover:bg-muted",
                )}
              >
                <span className="relative">
                  <EntityAvatar name={conversation.company} size="md" />
                  {conversation.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success">
                      <span className="sr-only">Online</span>
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{conversation.company}</span>
                    <span
                      className={cn(
                        "shrink-0 text-[11px]",
                        unread ? "font-semibold text-primary" : "text-subtle-foreground",
                      )}
                    >
                      {conversation.time}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                    {conversation.role}
                  </span>
                  <span className="mt-1.5 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm",
                        unread ? "font-medium text-strong-foreground" : "text-muted-foreground",
                      )}
                    >
                      {conversation.lastMessage}
                    </span>
                    {unread && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {conversation.unread}
                        <span className="sr-only"> mensagens não lidas</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
