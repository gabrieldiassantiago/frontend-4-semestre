"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Ban, Briefcase, Check, Clock, Copy, Layers3, Timer, Video, type LucideIcon } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Modal } from "@/components/ui/modal"
import { ROUTES } from "@/lib/config/routes"
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed"
import { useCancelarAgendamento } from "@/lib/queries/use-candidaturas"
import type { AgendamentoEmpresa } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"
import { STATUS_META, TIME_LABEL, endMs, isHappening, isLive, relativeStart, safeHref } from "./appointment-utils"

const WEEKDAY_LONG = new Intl.DateTimeFormat("pt-BR", { weekday: "long" })
const MONTH_SHORT = new Intl.DateTimeFormat("pt-BR", { month: "short" })

function Fact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold text-ink [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}

/** Detalhe da reunião (abre ao clicar num bloco do calendário) com ações e fluxo de cancelamento. */
export function AppointmentDetailModal({
  item,
  now,
  startInCancel = false,
  onClose,
}: {
  item: AgendamentoEmpresa | null
  now: number
  /** Abre direto na confirmação de cancelamento (atalho da lista). */
  startInCancel?: boolean
  onClose: () => void
}) {
  const cancelar = useCancelarAgendamento()
  const [sidebarCollapsed] = useSidebarCollapsed()
  const [cancelling, setCancelling] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [copied, setCopied] = useState(false)

  // Cada reunião aberta começa na visão de detalhes, sem restos do cancelamento anterior.
  const itemId = item?.id
  useEffect(() => {
    setCancelling(startInCancel)
    setMotivo("")
    setCopied(false)
  }, [itemId, startInCancel])

  function close() {
    if (cancelar.isPending) return
    onClose()
  }

  async function copyLink() {
    if (!item) return
    try {
      await navigator.clipboard.writeText(item.link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* área de transferência indisponível */
    }
  }

  function confirmCancel() {
    if (!item) return
    cancelar.mutate(
      { id: item.candidaturaId, agendamentoId: item.id, motivo: motivo.trim() || undefined },
      { onSuccess: onClose },
    )
  }

  const live = item ? isLive(item) : false
  const happening = item ? isHappening(item, now) : false
  const meta = item ? STATUS_META[item.status] : null
  const href = item ? safeHref(item.link) : null
  const relative = item && live ? relativeStart(item, now) : null
  const start = item ? new Date(item.inicio) : null

  const footer = !item ? null : cancelling ? (
    <>
      <button type="button" onClick={() => setCancelling(false)} disabled={cancelar.isPending} className="btn-secondary">
        Voltar
      </button>
      <button
        type="button"
        onClick={confirmCancel}
        disabled={cancelar.isPending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-danger px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {cancelar.isPending ? "Cancelando…" : "Confirmar cancelamento"}
      </button>
    </>
  ) : live ? (
    <>
      {/* No celular o rodapé não mostra a área da esquerda: o cancelar entra aqui. */}
      <button
        type="button"
        onClick={() => setCancelling(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-danger-foreground hover:bg-danger-subtle sm:hidden"
      >
        <Ban aria-hidden className="size-4" />
        Cancelar agendamento
      </button>
      <button type="button" onClick={close} className="btn-secondary">
        Fechar
      </button>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          <Video aria-hidden className="size-4" />
          {happening ? "Entrar agora" : "Entrar na reunião"}
        </a>
      )}
    </>
  ) : (
    <button type="button" onClick={close} className="btn-secondary">
      Fechar
    </button>
  )

  return (
    <Modal
      open={item !== null}
      onClose={close}
      title={cancelling ? "Cancelar agendamento" : "Detalhes do agendamento"}
      description={item && cancelling ? `${item.titulo} com ${item.candidatoNome}` : undefined}
      size={cancelling ? "sm" : "lg"}
      // Centraliza sobre a área de conteúdo (desconta a largura do menu lateral no desktop).
      className={sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-64"}
      footerStart={
        item && live && !cancelling ? (
          <button
            type="button"
            onClick={() => setCancelling(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-danger-foreground transition-colors hover:bg-danger-subtle"
          >
            <Ban aria-hidden className="size-4" />
            Cancelar agendamento
          </button>
        ) : undefined
      }
      footer={footer}
    >
      {item && meta && start && !cancelling && (
        <div className="flex flex-col gap-6">
          {/* Data em destaque + título */}
          <div className="flex items-start gap-5">
            <div className="grid w-20 shrink-0 place-items-center rounded-2xl bg-primary-subtle py-3 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {MONTH_SHORT.format(start).replace(".", "")}
              </span>
              <span className="text-3xl font-semibold tabular-nums leading-none tracking-tight text-ink">{start.getDate()}</span>
              <span className="mt-1 text-[11px] capitalize text-muted-foreground">{WEEKDAY_LONG.format(start).replace("-feira", "")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", meta.text)}>
                  <span aria-hidden className={cn("size-2 rounded-full", meta.dot, happening && "motion-safe:animate-pulse")} />
                  {meta.label}
                </span>
                {relative && <span className="text-sm font-semibold text-primary">{relative}</span>}
              </div>
              <h3 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight text-ink [overflow-wrap:anywhere]">{item.titulo}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.criadoPorNome ? `Agendado por ${item.criadoPorNome}` : "Agendamento da empresa"}
              </p>
            </div>
          </div>

          {/* Candidato */}
          <Link
            href={ROUTES.company.candidate(item.candidaturaId)}
            className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-primary-subtle/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <EntityAvatar name={item.candidatoNome} src={item.candidatoImagemUrl} size="sm" className="size-14 shrink-0 rounded-full" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-ink group-hover:text-primary">{item.candidatoNome}</span>
              {item.candidatoHeadline && <span className="block truncate text-sm text-muted-foreground">{item.candidatoHeadline}</span>}
              {item.candidatoEmail && <span className="block truncate text-xs text-muted-foreground">{item.candidatoEmail}</span>}
            </span>
            <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">
              Ver candidatura
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </Link>

          {/* Fatos em grade */}
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact icon={Clock} label="Horário">
              <span className="tabular-nums">
                {TIME_LABEL.format(start)} – {TIME_LABEL.format(new Date(endMs(item)))}
              </span>
            </Fact>
            <Fact icon={Timer} label="Duração">
              {item.duracaoMinutos} minutos
            </Fact>
            <Fact icon={Briefcase} label="Vaga">
              {item.vagaTitulo}
            </Fact>
            <Fact icon={Layers3} label="Etapa">
              {item.etapaDescricao || "—"}
            </Fact>
          </dl>

          {/* Link da reunião */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Link da reunião</p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-4 pr-1.5">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm text-primary hover:underline">
                  {item.link}
                </a>
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.link}</span>
              )}
              <button
                type="button"
                onClick={() => void copyLink()}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-muted px-3 text-xs font-semibold text-strong-foreground transition-colors hover:bg-border"
              >
                {copied ? <Check aria-hidden className="size-3.5 text-mint-strong" /> : <Copy aria-hidden className="size-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {item.mensagem && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Mensagem ao candidato</p>
              <p className="whitespace-pre-line border-l-2 border-primary-soft pl-4 text-sm leading-relaxed text-strong-foreground">{item.mensagem}</p>
            </div>
          )}

          {item.status === "CANCELADO" && item.motivoCancelamento && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Motivo do cancelamento</p>
              <p className="border-l-2 border-border-strong pl-4 text-sm leading-relaxed text-strong-foreground">{item.motivoCancelamento}</p>
            </div>
          )}
        </div>
      )}

      {item && cancelling && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">O candidato será avisado de que a reunião foi cancelada.</p>
          <div>
            <label htmlFor="motivo-cancelamento" className="mb-1.5 block text-sm font-medium text-foreground">
              Motivo <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="motivo-cancelamento"
              data-autofocus
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ex.: precisamos remarcar por conflito de agenda"
              className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
