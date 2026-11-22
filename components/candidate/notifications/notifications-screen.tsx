"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BellRing, Briefcase, CheckCheck, Inbox, RefreshCw } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import {
  NOTIFICACOES_REFRESH_MS,
  useMarcarNotificacaoLida,
  useMarcarTodasNotificacoesLidas,
  useNotificacoes,
} from "@/lib/queries/use-notificacoes"
import {
  TIPOS_NOTIFICACAO,
  TIPO_NOTIFICACAO_LABELS,
  isNaoLida,
  type TipoNotificacao,
} from "@/lib/types/notificacao.types"
import { cn } from "@/lib/utils"
import { NotificationItem, NotificationItemSkeleton } from "./notification-item"
import { TIPO_META, agruparPorData } from "./notification-meta"

type Leitura = "todas" | "nao-lidas"

export function NotificationsScreen() {
  const { notificacoes, naoLidas, loading, refreshing, error, refetch } = useNotificacoes()
  const marcarLida = useMarcarNotificacaoLida()
  const marcarTodas = useMarcarTodasNotificacoesLidas()
  const [leitura, setLeitura] = useState<Leitura>("todas")
  const [tipo, setTipo] = useState<TipoNotificacao | null>(null)

  const contagemPorTipo = useMemo(() => {
    const contagem: Record<TipoNotificacao, number> = { CANDIDATURA: 0, CHAT: 0, VAGAS: 0 }
    notificacoes.forEach((n) => {
      if (n.type in contagem) contagem[n.type] += 1
    })
    return contagem
  }, [notificacoes])

  const grupos = useMemo(() => {
    const filtradas = notificacoes.filter(
      (n) => (leitura === "todas" || isNaoLida(n)) && (tipo === null || n.type === tipo),
    )
    return agruparPorData(filtradas)
  }, [notificacoes, leitura, tipo])

  const filtrosAtivos = leitura !== "todas" || tipo !== null
  const limparFiltros = () => {
    setLeitura("todas")
    setTipo(null)
  }

  return (
    <PageShell className="max-w-4xl [&_.btn-primary]:rounded-full [&_.btn-secondary]:rounded-full">
      <PageHeader
        eyebrow="Central de alertas"
        title="Notificações"
        description={`Etapas, mensagens das empresas e novas vagas em um só lugar. A lista se atualiza sozinha a cada ${NOTIFICACOES_REFRESH_MS / 1000} segundos.`}
        actions={
          <>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={refreshing}
              className="btn-secondary"
            >
              <RefreshCw aria-hidden className={cn("size-4", refreshing && "animate-spin")} />
              Atualizar
            </button>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={() => marcarTodas.mutate()}
                disabled={marcarTodas.isPending}
                className="btn-primary"
              >
                <CheckCheck aria-hidden className="size-4" />
                Marcar todas como lidas
              </button>
            )}
          </>
        }
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Status de leitura" className="inline-flex gap-1 self-start rounded-full border border-border/60 bg-card p-1">
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
              aria-selected={leitura === tab.id}
              onClick={() => setLeitura(tab.id)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full pl-4 pr-1.5 text-sm font-medium transition-colors",
                leitura === tab.id ? "bg-primary text-white" : "text-strong-foreground hover:bg-primary-subtle hover:text-primary",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs font-semibold tabular-nums",
                  leitura === tab.id ? "bg-white text-primary" : "bg-surface text-strong-foreground",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
          {TIPOS_NOTIFICACAO.map((item) => {
            const Icon = TIPO_META[item].icon
            const active = tipo === item
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setTipo(active ? null : item)}
                className={cn(
                  "group inline-flex min-h-10 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary-subtle text-primary"
                    : "border-border/60 bg-card text-strong-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                <span className={cn("grid size-8 place-items-center rounded-full transition-colors", active ? "bg-primary text-white" : "bg-surface group-hover:bg-primary-subtle")}>
                  <Icon aria-hidden className="size-4" />
                </span>
                {TIPO_NOTIFICACAO_LABELS[item]}
                <span className={cn("text-xs tabular-nums", active ? "text-primary" : "text-muted-foreground")}>{contagemPorTipo[item]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <ul aria-busy="true" aria-label="Carregando notificações" className="divide-y divide-border/60 overflow-hidden rounded-[28px] border border-border/60 bg-card">
            {Array.from({ length: 4 }).map((_, index) => (
              <NotificationItemSkeleton key={index} />
            ))}
          </ul>
        ) : error ? (
          <ErrorState
            description={error}
            action={
              <button type="button" onClick={() => void refetch()} className="btn-primary">
                Tentar novamente
              </button>
            }
          />
        ) : grupos.length === 0 ? (
          filtrosAtivos && notificacoes.length > 0 ? (
            <EmptyState
              icon={Inbox}
              title="Nada por aqui com esses filtros"
              description="Ajuste os filtros para ver outras notificações."
              action={
                <button type="button" onClick={limparFiltros} className="btn-secondary">
                  Limpar filtros
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={BellRing}
              title="Você está em dia"
              description="Atualizações de etapas, feedbacks e alertas de vagas aparecerão aqui."
              action={
                <Link href={ROUTES.candidate.jobs} className="btn-primary">
                  <Briefcase aria-hidden className="size-4" />
                  Explorar oportunidades
                </Link>
              }
            />
          )
        ) : (
          <div className="flex flex-col gap-7">
            {grupos.map((grupo) => (
              <section key={grupo.label} aria-labelledby={`grupo-${grupo.label}`} className="motion-enter">
                <div className="mb-3 flex items-center gap-2 px-2">
                  <h2 id={`grupo-${grupo.label}`} className="text-sm font-semibold tracking-tight text-foreground">
                    {grupo.label}
                  </h2>
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">{grupo.itens.length}</span>
                </div>
                <ul className="divide-y divide-border/60 overflow-hidden rounded-[28px] border border-border/60 bg-card">
                  {grupo.itens.map((notificacao) => (
                    <NotificationItem
                      key={notificacao.notificacaoId}
                      notificacao={notificacao}
                      onMarkAsRead={(id) => marcarLida.mutate(id)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
