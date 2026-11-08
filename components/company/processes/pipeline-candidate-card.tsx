"use client"
import Link from "next/link"
import { ArrowUpRight, FileText, MessageSquareQuote, MoreHorizontal, UserRound } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { ROUTES } from "@/lib/config/routes"
import { formatRelativeDate } from "@/lib/format"
import type { Candidatura } from "@/lib/types/candidatura.types"

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

  return (
    <article
      className="relative min-w-0 rounded-[20px] border border-black/[0.035] bg-card shadow-[0_2px_3px_-2px_rgba(24,24,27,0.06)] transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[0_6px_20px_-10px_rgba(24,24,27,0.15)]">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`Avaliar candidatura de ${name}`}
        className="block w-full rounded-[20px] p-5 text-left">
        <div className="flex min-w-0 items-center gap-3 pr-9">
          <EntityAvatar name={name} src={item.candidatoImagemUrl} size="sm" className="size-9 rounded-full font-medium" />
          <h3 className="min-w-0 break-words text-sm font-medium leading-5 tracking-[-0.02em] text-foreground">{name}</h3>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.candidatoHeadline || item.candidatoEmail || "Candidatura recebida"}</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.createdAt ? `Inscrição ${formatRelativeDate(item.createdAt)}` : "Data de inscrição não informada"}</p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <div>
            <span className="block text-[11px] text-muted-foreground">Feedbacks</span>
            <span className="mt-1 flex items-center gap-1.5 text-sm font-medium tabular-nums text-foreground"><MessageSquareQuote aria-hidden className="size-3.5 text-subtle-foreground" />{feedbacks}</span>
          </div>
          <span
            className={item.curriculoUrl ? "inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-1.5 text-[10px] font-medium text-primary-subtle-foreground" : "rounded-full bg-surface px-2.5 py-1.5 text-[10px] text-muted-foreground"}>
            {item.curriculoUrl && <FileText aria-hidden className="size-3" />}
            {item.curriculoUrl ? "Currículo anexado" : "Currículo indisponível"}
          </span>
        </div>
      </button>

      <details className="absolute right-4 top-5 z-10">
        <summary
          aria-label={`Opções para ${name}`}
          className="grid size-8 cursor-pointer list-none place-items-center rounded-lg border border-border-subtle text-muted-foreground transition-colors hover:bg-surface [&::-webkit-details-marker]:hidden"><MoreHorizontal aria-hidden className="size-4" /></summary>
        <div
          className="absolute right-0 top-10 w-52 rounded-xl border border-border bg-card p-1.5 shadow-raised">
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

      <div
        className="mx-5 flex min-h-12 items-center justify-between gap-2 border-t border-border-subtle py-2">
        {item.status === "EM_ANDAMENTO" ? <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span aria-hidden className="size-1.5 rounded-full bg-primary/60" />Em andamento</span> : <StatusBadge status={item.status} size="sm" />}
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`Abrir candidatura de ${name}`}
          className="inline-flex min-h-8 items-center gap-1 rounded-md px-1 text-[11px] font-medium text-strong-foreground transition-colors hover:text-primary">Avaliar<ArrowUpRight aria-hidden className="size-3.5" /></button>
      </div>
    </article>
  )
}
