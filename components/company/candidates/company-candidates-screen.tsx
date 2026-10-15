"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Briefcase, Search, Users, X } from "lucide-react"

import { ROUTES } from "@/lib/config/routes"
import { PageHeader, PageShell } from "@/components/ui/page"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { InputWithIcon } from "@/components/ui/form-field"
import { EtapaProgresso, StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"

export function CompanyCandidatesScreen() {
  const { candidaturas, loading, error, refetch } = useCandidaturasEmpresa()
  const [query, setQuery] = useState("")

  const candidates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR")
    if (!normalizedQuery) return candidaturas

    return candidaturas.filter((item) =>
      [item.candidatoNome, item.candidatoHeadline, item.vagaTitulo]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery)
    )
  }, [candidaturas, query])

  if (loading) return <RouteSkeleton variant="candidates" />

  return (
    <PageShell className="max-w-[1380px] space-y-8">
      <PageHeader
        eyebrow="Talentos"
        title="Candidatos"
        description="Consulte os perfis e acompanhe o progresso das candidaturas recebidas."
      />

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-xs backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <InputWithIcon
            wrapperClassName="w-full"
            icon={Search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, cargo ou vaga..."
            aria-label="Buscar candidatos"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
              Limpar filtro
            </button>
          )}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Users className="size-3.5 text-primary/80" aria-hidden />
            <strong className="font-semibold text-foreground">{candidates.length}</strong>{" "}
            {candidates.length === 1 ? "candidatura" : "candidaturas"}
          </span>
        </div>
      </div>

      {/* Estados de Retorno (Erro, Vazio ou Lista) */}
      {error ? (
        <ErrorState
          description={error}
          action={
            <button className="btn-secondary" onClick={() => void refetch()}>
              Tentar novamente
            </button>
          }
        />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "Nenhum candidato encontrado" : "Nenhuma candidatura recebida"}
          description={
            query
              ? `Não encontramos resultados para "${query}". Experimente outros termos.`
              : "Os candidatos aparecerão aqui assim que se inscreverem nas suas vagas."
          }
          action={
            query ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setQuery("")}
              >
                Limpar busca
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="flex">
              <Link
                href={ROUTES.company.candidate(candidate.id)}
                className="group relative flex w-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div>
                  {/* Cabeçalho do Candidato */}
                  <div className="flex items-start gap-3.5">
                    <div className="shrink-0 rounded-full ring-2 ring-border/50 transition-all group-hover:ring-primary/30">
                      <EntityAvatar name={candidate.candidatoNome} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {candidate.candidatoNome ?? "Candidato sem nome"}
                      </h2>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {candidate.candidatoHeadline || "Perfil profissional em atualização"}
                      </p>
                    </div>
                  </div>

                  {/* Contexto da Vaga & Status */}
                  <div className="mt-5 rounded-xl border border-border/50 bg-muted/30 p-3.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="size-3.5 shrink-0 text-primary/70" aria-hidden />
                      <span className="truncate font-medium text-foreground">
                        {candidate.vagaTitulo}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                      <StatusBadge status={candidate.status} size="sm" />
                      <EtapaProgresso
                        etapa={candidate.etapaAtual}
                        status={candidate.status}
                        etapasVaga={candidate.etapasVaga}
                      />
                    </div>
                  </div>
                </div>

                {/* Rodapé de Ação (Sempre alinhado na base do Card) */}
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-semibold text-primary">
                  <span>Ver candidatura completa</span>
                  <span className=" inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}