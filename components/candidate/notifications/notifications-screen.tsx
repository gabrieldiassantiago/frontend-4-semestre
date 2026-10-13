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
    <PageShell className="max-w-4xl">
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
        <div role="tablist" aria-label="Status de leitura" className="inline-flex gap-1 self-start rounded-xl border border-border bg-card p-1">
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
                "inline-flex min-h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors",
                leitura === tab.id ? "bg-strong text-strong-contrast" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  leitura === tab.id ? "bg-strong-contrast/15" : "bg-muted",
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
                  "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                    : "border-border bg-card text-strong-foreground hover:border-border-strong",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {TIPO_NOTIFICACAO_LABELS[item]}
                <span className="text-xs tabular-nums text-muted-foreground">{contagemPorTipo[item]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <ul aria-busy="true" aria-label="Carregando notificações" className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border bg-card">
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
          <div className="flex flex-col gap-8">
            {grupos.map((grupo) => (
              <section key={grupo.label} aria-labelledby={`grupo-${grupo.label}`} className="motion-enter">
                <div className="mb-3 flex items-center gap-3">
                  <h2 id={`grupo-${grupo.label}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {grupo.label}
                  </h2>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                  <span className="text-xs tabular-nums text-subtle-foreground">{grupo.itens.length}</span>
                </div>
                <ul className="divide-y divide-border-subtle overflow-hidden rounded-card border border-border bg-card shadow-card">
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
