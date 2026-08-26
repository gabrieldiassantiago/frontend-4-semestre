"use client"

import { Bookmark, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { VagaHighlights, VagaTags } from "@/components/vaga/vaga-facts"
import { formatRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Vaga } from "@/lib/types/vaga.types"
import { STATUS_LABELS, type StatusCandidatura } from "@/lib/types/candidatura.types"

export function JobCard({
  vaga,
  saved,
  selected,
  applied,
  onSelect,
  onToggleSave,
}: {
  vaga: Vaga
  saved: boolean
  selected: boolean
  /** Situação da candidatura já enviada, quando existir. */
  applied?: StatusCandidatura
  onSelect: () => void
  onToggleSave: () => void
}) {
  const company = vaga.companyName ?? "Empresa confidencial"

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-card border bg-card p-5 transition-[box-shadow,border-color] duration-200",
        selected
          ? "border-primary shadow-raised"
          : "border-border hover:border-border-strong hover:shadow-raised",
      )}
    >
      <header className="flex items-start gap-3">
        <EntityAvatar name={company} size="md" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-muted-foreground">{company}</p>
          <h3 className="mt-1 text-base font-bold leading-snug tracking-tight text-foreground">
            {/*
              O botão do título é o alvo de clique de todo o card (after:inset-0),
              mantendo um único controle focável em vez de aninhar interativos.
            */}
            <button
              type="button"
              onClick={onSelect}
              aria-pressed={selected}
              className="text-left text-pretty after:absolute after:inset-0 after:rounded-card after:content-['']"
            >
              {vaga.titulo}
            </button>
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remover ${vaga.titulo} dos salvos` : `Salvar ${vaga.titulo}`}
          className={cn(
            "relative z-10 -mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full transition-colors",
            saved
              ? "text-primary"
              : "text-subtle-foreground hover:bg-muted hover:text-strong-foreground",
          )}
        >
          <Bookmark className={cn("size-[18px]", saved && "fill-current")} />
        </button>
      </header>

      <VagaTags vaga={vaga} size="sm" className="mt-4" />

      <VagaHighlights vaga={vaga} className="mt-4" />

      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
        {applied ? (
          <Badge variant={applied === "EM_ANDAMENTO" ? "success" : "neutral"} size="sm">
            <Check aria-hidden />
            {applied === "EM_ANDAMENTO" ? "Candidatura enviada" : STATUS_LABELS[applied]}
          </Badge>
        ) : selected ? (
          <Badge variant="primary" size="sm">
            Selecionada
          </Badge>
        ) : (
          <span className="text-sm font-semibold text-primary group-hover:underline">
            Ver detalhes
          </span>
        )}

        {vaga.createdAt && (
          <time dateTime={vaga.createdAt} className="text-xs text-subtle-foreground">
            {formatRelativeDate(vaga.createdAt)}
          </time>
        )}
      </footer>
    </article>
  )
}
