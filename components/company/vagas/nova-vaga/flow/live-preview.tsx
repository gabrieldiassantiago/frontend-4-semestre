"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Briefcase, Eye, Gift, ListChecks, MapPin } from "lucide-react"
import { CompanyLogo } from "@/components/shared/company-logo"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
} from "@/lib/types/vaga.types"
import type { VagaDraft } from "./types"

function Animated({ value, className }: { value: string; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        className={cn("inline-block", className)}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

/** Cartão de como a vaga aparece para o candidato, atualizado a cada resposta. */
export function LivePreview({
  draft,
  companyName,
  logoUrl,
  className,
}: {
  draft: VagaDraft
  companyName: string
  logoUrl?: string | null
  className?: string
}) {
  const titulo = draft.titulo.trim()
  const visibleBenefits = draft.beneficios.slice(0, 3)
  const hiddenBenefits = draft.beneficios.length - visibleBenefits.length

  return (
    <section aria-label="Prévia da vaga" className={className}>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Eye className="size-3.5" aria-hidden />
        Como o candidato verá
      </p>

      <div className="overflow-hidden rounded-panel border border-border bg-card shadow-raised">
        <div className="h-16 bg-gradient-to-br from-primary/15 via-primary-subtle to-card" aria-hidden />
        <div className="-mt-7 px-5 pb-5">
          <div className="inline-flex rounded-xl bg-card p-1 shadow-card">
            <CompanyLogo url={logoUrl} name={companyName} size="sm" />
          </div>
          <p className="mt-3 truncate text-xs font-medium text-muted-foreground">{companyName}</p>
          <h3
            className={cn(
              "mt-1 text-lg font-bold leading-snug tracking-tight text-balance",
              titulo ? "text-foreground" : "text-subtle-foreground",
            )}
          >
            {titulo || "Título da vaga"}
          </h3>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-strong-foreground">
              {MODALIDADE_LABELS[draft.modalidade]}
            </span>
            <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary-subtle-foreground">
              {draft.quantidadeVagas || 1} {(draft.quantidadeVagas || 1) === 1 ? "vaga disponível" : "vagas disponíveis"}
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            <Animated value={draft.salario > 0 ? formatCurrency(draft.salario) : "R$ —"} />
            <span className="ml-1 text-xs font-medium text-muted-foreground">/ mês</span>
          </p>

          <dl className="mt-4 space-y-2.5 border-t border-border-subtle pt-4 text-xs">
            <div className="flex items-start gap-2 text-strong-foreground">
              <dt>
                <Briefcase className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="sr-only">Área</span>
              </dt>
              <dd className="min-w-0 truncate">{CATEGORIA_LABELS[draft.categoria]}</dd>
            </div>
            <div className="flex items-start gap-2 text-strong-foreground">
              <dt>
                <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="sr-only">Local</span>
              </dt>
              <dd className="min-w-0 truncate">
                {draft.cidade ? `${draft.cidade}${draft.estado ? `, ${draft.estado}` : ""}` : "Local a definir"}
              </dd>
            </div>
            <div className="flex items-start gap-2 text-strong-foreground">
              <dt>
                <ListChecks className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="sr-only">Processo</span>
              </dt>
              <dd>
                {draft.etapas.length} {draft.etapas.length === 1 ? "etapa" : "etapas"} no processo
              </dd>
            </div>
          </dl>

          {visibleBenefits.length > 0 && (
            <div className="mt-4 border-t border-border-subtle pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Gift className="size-3.5" aria-hidden />
                Benefícios
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {visibleBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="max-w-full truncate rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-strong-foreground"
                  >
                    {benefit}
                  </li>
                ))}
                {hiddenBenefits > 0 && (
                  <li className="rounded-md px-2 py-1 text-[11px] font-semibold text-primary">
                    +{hiddenBenefits}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
