"use client"

import { useState } from "react"
import Link from "next/link"
import { Ban, Briefcase, Check, Copy, Layers3, Video } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ROUTES } from "@/lib/config/routes"
import type { AgendamentoEmpresa } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"
import { TIME_LABEL, endMs, isHappening, isLive, relativeStart, safeHref, STATUS_META } from "./appointment-utils"

/**
 * Uma reunião na agenda. A hierarquia é: quem é o candidato → o que será tratado →
 * contexto (vaga/etapa) → ações. A reunião que está acontecendo ganha o roxo da marca
 * inteiro; reuniões encerradas ficam quietas, sem ações.
 */
export function AppointmentCard({
  item,
  now,
  onCancel,
}: {
  item: AgendamentoEmpresa
  now: number
  onCancel: (item: AgendamentoEmpresa) => void
}) {
  const [copied, setCopied] = useState(false)
  const meta = STATUS_META[item.status]
  const live = isLive(item)
  const happening = isHappening(item, now)
  const relative = live ? relativeStart(item, now) : null
  const href = safeHref(item.link)
  const start = new Date(item.inicio)
  const end = new Date(endMs(item))

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* área de transferência indisponível: o link continua acessível em "Entrar" */
    }
  }

  return (
    <li className="grid min-w-0 gap-x-6 gap-y-2 sm:grid-cols-[5rem_minmax(0,1fr)]">
      {/* Horário */}
      <div className="flex items-baseline gap-2 sm:flex-col sm:gap-0.5 sm:pt-5">
        <time
          dateTime={item.inicio}
          className={cn("text-xl font-semibold tabular-nums leading-none tracking-tight", live ? "text-ink" : "text-muted-foreground")}
        >
          {TIME_LABEL.format(start)}
        </time>
        <p className="text-xs tabular-nums text-muted-foreground">
          <span className="sm:hidden">até </span>
          <span className="hidden sm:inline">{TIME_LABEL.format(end)} · </span>
          {item.duracaoMinutos} min
        </p>
      </div>

      <article
        className={cn(
          "relative min-w-0 overflow-hidden rounded-2xl transition-shadow duration-200",
          happening
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : live
              ? "border border-border bg-card shadow-xs hover:shadow-md"
              : "border border-border-subtle bg-surface",
        )}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <EntityAvatar
              name={item.candidatoNome}
              src={item.candidatoImagemUrl}
              size="sm"
              className={cn("size-12 shrink-0 rounded-full", happening && "ring-2 ring-white/70", !live && "grayscale")}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <Link
                  href={ROUTES.company.candidate(item.candidaturaId)}
                  className={cn(
                    "truncate text-base font-semibold leading-snug tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2",
                    happening ? "text-white hover:underline focus-visible:outline-white" : "text-foreground hover:text-primary focus-visible:outline-primary",
                  )}
                >
                  {item.candidatoNome}
                </Link>
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", happening ? "text-white" : meta.text)}>
                  <span
                    aria-hidden
                    className={cn("size-1.5 rounded-full", happening ? "bg-mint motion-safe:animate-pulse" : meta.dot)}
                  />
                  {happening ? "Acontecendo agora" : meta.label}
                </span>
              </div>
              {item.candidatoHeadline && (
                <p className={cn("truncate text-xs", happening ? "text-white/75" : "text-muted-foreground")}>{item.candidatoHeadline}</p>
              )}
            </div>
          </div>

          <p
            className={cn(
              "mt-4 text-[15px] font-medium leading-snug [overflow-wrap:anywhere]",
              happening ? "text-white" : live ? "text-ink" : "text-strong-foreground",
            )}
          >
            {item.titulo}
          </p>

          <p className={cn("mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", happening ? "text-white/75" : "text-muted-foreground")}>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Briefcase aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{item.vagaTitulo}</span>
            </span>
            {item.etapaDescricao && (
              <span className="inline-flex items-center gap-1.5">
                <Layers3 aria-hidden className="size-3.5 shrink-0" />
                {item.etapaDescricao}
              </span>
            )}
            {relative && !happening && <span className="font-semibold text-primary">{relative}</span>}
          </p>

          {live && item.mensagem && (
            <p
              className={cn(
                "mt-3 line-clamp-2 border-l-2 pl-3 text-sm italic",
                happening ? "border-white/40 text-white/85" : "border-primary-soft text-muted-foreground",
              )}
            >
              {item.mensagem}
            </p>
          )}
          {item.status === "CANCELADO" && item.motivoCancelamento && (
            <p className="mt-3 border-l-2 border-border-strong pl-3 text-sm italic text-muted-foreground">{item.motivoCancelamento}</p>
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5",
            happening ? "border-white/20" : "border-border-subtle",
          )}
        >
          <p className={cn("text-xs", happening ? "text-white/75" : "text-muted-foreground")}>
            {item.criadoPorNome ? (
              <>
                Agendado por <span className={cn("font-medium", happening ? "text-white" : "text-strong-foreground")}>{item.criadoPorNome}</span>
              </>
            ) : (
              "Agendamento da empresa"
            )}
          </p>

          {live && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void copyLink()}
                aria-label={copied ? "Link copiado" : "Copiar link da reunião"}
                title={copied ? "Link copiado" : "Copiar link"}
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-colors",
                  happening ? "text-white hover:bg-white/15" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {copied ? <Check aria-hidden className="size-4 text-mint-strong" /> : <Copy aria-hidden className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => onCancel(item)}
                aria-label={`Cancelar agendamento com ${item.candidatoNome}`}
                title="Cancelar agendamento"
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-colors",
                  happening ? "text-white hover:bg-white/15" : "text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground",
                )}
              >
                <Ban aria-hidden className="size-4" />
              </button>
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "ml-1 inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                    happening ? "bg-white text-primary hover:bg-white/90" : "bg-ink text-white hover:bg-primary",
                  )}
                >
                  <Video aria-hidden className="size-4" />
                  {happening ? "Entrar agora" : "Entrar"}
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </li>
  )
}
