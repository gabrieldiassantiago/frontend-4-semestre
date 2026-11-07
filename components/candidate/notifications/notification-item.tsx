"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { isNaoLida, type Notificacao } from "@/lib/types/notificacao.types"
import { cn } from "@/lib/utils"
import { formatNotificacaoTempo, getTipoMeta } from "./notification-meta"

export function NotificationItem({
  notificacao,
  compact = false,
  onMarkAsRead,
  onNavigate,
}: {
  notificacao: Notificacao
  compact?: boolean
  onMarkAsRead: (id: string) => void
  onNavigate?: () => void
}) {
  const meta = getTipoMeta(notificacao.type)
  const unread = isNaoLida(notificacao)
  const Icon = meta.icon

  return (
    <li className="group relative">
      <div
        className={cn(
          "relative flex items-start gap-3.5 transition-colors hover:bg-muted",
          compact ? "px-4 py-3" : "px-4 py-4 sm:px-5",
          unread && "bg-primary-subtle/50 hover:bg-primary-subtle",
        )}
      >
        <span className="relative shrink-0">
          <span className={cn("grid place-items-center rounded-xl", compact ? "size-9" : "size-10", meta.tone)}>
            <Icon aria-hidden className={compact ? "size-4" : "size-[18px]"} />
          </span>
          {unread && (
            <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p
              className={cn(
                "min-w-0 text-sm leading-snug text-pretty",
                unread ? "font-semibold text-foreground" : "font-medium text-strong-foreground",
              )}
            >
              <Link
                href={meta.href}
                onClick={() => {
                  if (unread) onMarkAsRead(notificacao.notificacaoId)
                  onNavigate?.()
                }}
                className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary"
              >
                {unread && <span className="sr-only">Não lida: </span>}
                {notificacao.titulo}
              </Link>
            </p>
            <time
              dateTime={notificacao.createdAt}
              className="shrink-0 text-xs tabular-nums text-subtle-foreground"
            >
              {formatNotificacaoTempo(notificacao.createdAt)}
            </time>
          </div>

          <p
            className={cn(
              "mt-1 text-sm leading-relaxed text-muted-foreground text-pretty",
              compact ? "line-clamp-2" : "line-clamp-3",
            )}
          >
            {notificacao.descricao}
          </p>

          {!compact && (
            <p className="mt-2.5 text-xs font-semibold uppercase tracking-wider text-subtle-foreground">{meta.label}</p>
          )}
        </div>

        {unread && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notificacao.notificacaoId)}
            aria-label={`Marcar "${notificacao.titulo}" como lida`}
            title="Marcar como lida"
            className="relative z-10 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-[opacity,background-color,color] hover:bg-card hover:text-primary focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Check aria-hidden className="size-4" />
          </button>
        )}
      </div>
    </li>
  )
}

export function NotificationItemSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <li aria-hidden className={cn("flex items-start gap-3.5", compact ? "px-4 py-3" : "px-4 py-4 sm:px-5")}>
      <span className={cn("skeleton-shimmer shrink-0 rounded-xl", compact ? "size-9" : "size-10")} />
      <span className="flex flex-1 flex-col gap-2 pt-0.5">
        <span className="skeleton-shimmer h-3.5 w-2/3 rounded" />
        <span className="skeleton-shimmer h-3 w-full rounded" />
        <span className="skeleton-shimmer h-3 w-1/2 rounded" />
      </span>
    </li>
  )
}
