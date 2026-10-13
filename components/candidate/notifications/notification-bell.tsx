"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Bell, BellOff, CheckCheck } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { useDismissable } from "@/lib/hooks/use-dismissable"
import {
  useMarcarNotificacaoLida,
  useMarcarTodasNotificacoesLidas,
  useNotificacoes,
} from "@/lib/queries/use-notificacoes"
import { isNaoLida } from "@/lib/types/notificacao.types"
import { cn } from "@/lib/utils"
import { NotificationItem, NotificationItemSkeleton } from "./notification-item"

const PREVIEW_LIMIT = 6

type Filtro = "todas" | "nao-lidas"

function formatBadge(count: number) {
  return count > 9 ? "9+" : String(count)
}

/** Sino da topbar: abre um painel com as notificações recentes sem sair da tela. */
export function NotificationBell() {
  const { ref, open, toggle, close } = useDismissable()
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const { notificacoes, naoLidas, loading, error, refetch } = useNotificacoes()
  const marcarLida = useMarcarNotificacaoLida()
  const marcarTodas = useMarcarTodasNotificacoesLidas()

  const filtradas = filtro === "nao-lidas" ? notificacoes.filter(isNaoLida) : notificacoes
  const visiveis = filtradas.slice(0, PREVIEW_LIMIT)
  const restantes = filtradas.length - visiveis.length

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="notificacoes-painel"
        aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : "Notificações"}
        className={cn(
          "relative grid size-10 place-items-center rounded-lg transition-colors hover:bg-muted hover:text-foreground",
          open ? "bg-muted text-foreground" : "text-muted-foreground",
        )}
      >
        <Bell aria-hidden className="size-5" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span
            aria-hidden
            className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none tabular-nums text-primary-foreground ring-2 ring-card"
          >
            {formatBadge(naoLidas)}
          </span>
        )}
      </button>

      <div
        id="notificacoes-painel"
        role="dialog"
        aria-label="Notificações recentes"
        inert={!open}
        className={cn(
          "fixed inset-x-3 top-[4.5rem] z-50 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-overlay transition-[opacity,transform] duration-150",
          "sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem] sm:origin-top-right",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Notificações</h2>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Carregando…"
                : error
                  ? "Indisponível no momento"
                  : naoLidas > 0
                    ? `${naoLidas} ${naoLidas === 1 ? "não lida" : "não lidas"}`
                    : "Tudo em dia"}
            </p>
          </div>
          {naoLidas > 0 && (
            <button
              type="button"
              onClick={() => marcarTodas.mutate()}
              disabled={marcarTodas.isPending}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle disabled:opacity-50"
            >
              <CheckCheck aria-hidden className="size-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div role="tablist" aria-label="Filtrar notificações" className="mx-4 mb-2 flex gap-1 rounded-lg bg-muted p-1">
          {(
            [
              { id: "todas", label: "Todas", count: notificacoes.length },
              { id: "nao-lidas", label: "Não lidas", count: naoLidas },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filtro === tab.id}
              onClick={() => setFiltro(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors",
                filtro === tab.id
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  filtro === tab.id ? "bg-primary-subtle text-primary-subtle-foreground" : "bg-border-subtle",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border-subtle">
          {loading ? (
            <ul aria-busy="true" aria-label="Carregando notificações" className="divide-y divide-border-subtle">
              {Array.from({ length: 3 }).map((_, index) => (
                <NotificationItemSkeleton key={index} compact />
              ))}
            </ul>
          ) : error ? (
            <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <p className="text-sm text-danger-foreground">{error}</p>
              <button type="button" onClick={() => void refetch()} className="text-sm font-semibold text-primary hover:text-primary-hover">
                Tentar novamente
              </button>
            </div>
          ) : visiveis.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <BellOff aria-hidden className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {filtro === "nao-lidas" ? "Nenhuma notificação não lida" : "Nenhuma notificação ainda"}
              </p>
              <p className="mt-1 max-w-60 text-xs leading-relaxed text-muted-foreground text-pretty">
                Atualizações das suas candidaturas e mensagens das empresas aparecem aqui.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {visiveis.map((notificacao) => (
                <NotificationItem
                  key={notificacao.notificacaoId}
                  notificacao={notificacao}
                  compact
                  onMarkAsRead={(id) => marcarLida.mutate(id)}
                  onNavigate={close}
                />
              ))}
            </ul>
          )}
        </div>

        <Link
          href={ROUTES.candidate.notifications}
          onClick={close}
          className="group flex items-center justify-center gap-1.5 border-t border-border bg-muted/60 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-subtle"
        >
          {restantes > 0 ? `Ver todas as notificações (+${restantes})` : "Ver todas as notificações"}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
