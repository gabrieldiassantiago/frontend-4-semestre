"use client"
import Link from "next/link"
import {
  MessageSquareQuote,
  MoreHorizontal,
  UserRound,
} from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatRelativeDate } from "@/lib/format"
import type { Candidatura } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

const NEW_WINDOW_MS = 2 * 86_400_000

export function PipelineCandidateCard(
  {
    item,
    onOpen,
  }: {
    item: Candidatura
    onOpen: () => void
  },
) {
  const name = item.candidatoNome?.trim() || "Candidato"
  const feedbacks = item.totalFeedbacks ?? 0
  const isNew = item.createdAt ? Date.now() - new Date(item.createdAt).getTime() <= NEW_WINDOW_MS : false
  const isOpen = item.status === "EM_ANDAMENTO"

  return (
    <article className="group relative min-w-0 rounded-lg border border-border bg-card transition-colors duration-150 hover:border-primary/50">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`Avaliar candidatura de ${name}`}
        className="block w-full rounded-lg p-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <div className="flex min-w-0 items-center gap-3 pr-8">
          <EntityAvatar name={name} src={item.candidatoImagemUrl} size="sm" className="size-9 shrink-0 rounded-full font-medium" />
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold leading-5 text-foreground">
              <span className="truncate">{name}</span>
              {isNew && <span className="shrink-0 text-[11px] font-medium text-primary">Novo</span>}
            </h3>
            <p className="truncate text-xs leading-5 text-muted-foreground">
              {item.candidatoHeadline || item.candidatoEmail || "Candidatura recebida"}
            </p>
          </div>
        </div>

        {!isOpen && <div className="mt-3"><StatusBadge status={item.status} size="sm" /></div>}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-subtle pt-2.5 text-xs text-muted-foreground">
          <span>{feedbacks > 0 ? `${feedbacks} ${feedbacks === 1 ? "feedback" : "feedbacks"}` : "Sem feedback"}</span>
          <span className={cn(!item.curriculoUrl && "text-subtle-foreground")}>
            {item.curriculoUrl ? "Currículo anexado" : "Sem currículo"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-subtle-foreground">
          Inscrito {item.createdAt ? formatRelativeDate(item.createdAt).toLowerCase() : "—"}
        </p>
      </button>

      <details className="absolute right-3 top-3 z-10">
        <summary
          aria-label={`Opções para ${name}`}
          className="grid size-8 cursor-pointer list-none place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"><MoreHorizontal aria-hidden className="size-4" /></summary>
        <div
          className="absolute right-0 top-10 w-52 rounded-lg border border-border bg-card p-1.5 shadow-raised">
          <button
            type="button"
            onClick={event => {
              event.currentTarget.closest("details")?.removeAttribute("open")
              onOpen()
            }}
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-xs text-strong-foreground hover:bg-surface"><MessageSquareQuote aria-hidden className="size-4" />Avaliar candidatura</button>
          <Link
            href={ROUTES.company.candidate(item.id)}
            className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs text-strong-foreground hover:bg-surface"><UserRound aria-hidden className="size-4" />Ver perfil completo</Link>
        </div>
      </details>
    </article>
  )
}
