"use client"

import Link from "next/link"
import { ArrowRight, BellOff } from "lucide-react"
import { formatNotificacaoTempo, getTipoMeta } from "@/components/candidate/notifications/notification-meta"
import { ROUTES } from "@/lib/config/routes"
import { useNotificacoes } from "@/lib/queries/use-notificacoes"
import { isNaoLida } from "@/lib/types/notificacao.types"
import { cn } from "@/lib/utils"

const LIMIT = 3

/** Painel "Novidades" do hero: últimas notificações. */
export function OverviewUpdates() {
  const { notificacoes, naoLidas, loading } = useNotificacoes()
  const recentes = notificacoes.slice(0, LIMIT)

  return (
    <section
      aria-labelledby="overview-updates-title"
      className="flex flex-col h-full rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="overview-updates-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          Novidades
          {naoLidas > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground">
              {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
            </span>
          )}
        </h2>
        <Link
          href={ROUTES.candidate.notifications}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-primary-subtle-foreground transition-colors hover:text-primary"
        >
          Ver todas
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <ul aria-busy="true" aria-label="Carregando novidades" className="mt-4 flex flex-col gap-3">
          {Array.from({ length: LIMIT }).map((_, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="size-9 shrink-0 animate-pulse rounded-xl bg-border" />
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="h-3 w-3/4 animate-pulse rounded bg-border" />
                <span className="h-2.5 w-1/2 animate-pulse rounded bg-border" />
              </span>
            </li>
          ))}
        </ul>
      ) : recentes.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center gap-3 rounded-xl border border-dashed border-border-strong bg-card px-4 py-5">
          <BellOff aria-hidden className="size-5 shrink-0 text-subtle-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Sem novidades por enquanto. Avisamos aqui quando suas candidaturas avançarem.
          </p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col">
          {recentes.map((notificacao) => {
            const meta = getTipoMeta(notificacao.type)
            const Icon = meta.icon
            const unread = isNaoLida(notificacao)
            return (
              <li key={notificacao.notificacaoId}>
                <Link
                  href={meta.href}
                  className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-card hover:shadow-card"
                >
                  <span className={cn("relative grid size-9 shrink-0 place-items-center rounded-xl", meta.tone)}>
                    <Icon aria-hidden className="size-4" />
                    {unread && (
                      <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-surface" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {unread && <span className="sr-only">Não lida: </span>}
                        {notificacao.titulo}
                      </span>
                      <time dateTime={notificacao.createdAt} className="shrink-0 text-[11px] tabular-nums text-subtle-foreground">
                        {formatNotificacaoTempo(notificacao.createdAt)}
                      </time>
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                      {notificacao.descricao}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
