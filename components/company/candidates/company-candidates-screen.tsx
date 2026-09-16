"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Search, Users } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { InputWithIcon } from "@/components/ui/form-field"
import { StatusBadge } from "@/components/candidatura/candidatura-ui"
import { useCandidaturasEmpresa } from "@/lib/hooks/useCandidaturas"
import { ETAPA_LABELS } from "@/lib/types/candidatura.types"

export function CompanyCandidatesScreen() {
  const { candidaturas, loading, error, refetch } = useCandidaturasEmpresa()
  const [query, setQuery] = useState("")
  const candidates = useMemo(() => candidaturas.filter(item => [item.candidatoNome, item.candidatoHeadline, item.vagaTitulo].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))), [candidaturas, query])
  if (loading) return <RouteSkeleton variant="candidates" />
  return <PageShell>
    <PageHeader eyebrow="Talentos" title="Candidatos" description="Conheça as pessoas que se candidataram às suas vagas. Cada candidatura reúne perfil, currículo e carta de apresentação." />
    <div className="mt-8"><InputWithIcon icon={Search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por candidato ou vaga" aria-label="Buscar candidatos" /></div>
    {error ? <div className="mt-6"><ErrorState description={error} action={<button className="btn-secondary" onClick={() => void refetch()}>Tentar novamente</button>} /></div> : candidates.length === 0 ? <EmptyState className="mt-6" icon={Users} title={query ? "Nenhum candidato encontrado" : "Nenhuma candidatura recebida"} description={query ? "Experimente buscar outro nome ou vaga." : "Os candidatos aparecerão aqui quando se inscreverem nas suas vagas."} /> : <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{candidates.map(candidate => <li key={candidate.id}>
      <Link href={"/empresa/candidatos/" + encodeURIComponent(candidate.id)} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary">
        <div className="flex items-start gap-3"><EntityAvatar name={candidate.candidatoNome} /><div className="min-w-0"><h2 className="break-words text-sm font-semibold">{candidate.candidatoNome ?? "Candidato"}</h2><p className="mt-1 text-xs text-muted-foreground">{candidate.candidatoHeadline || candidate.vagaTitulo}</p></div></div>
        <p className="mt-5 text-sm font-medium">{candidate.vagaTitulo}</p><div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge status={candidate.status} size="sm" /><span className="text-xs text-muted-foreground">{ETAPA_LABELS[candidate.etapaAtual]}</span></div>
        <span className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4 text-xs font-semibold text-primary">Ver candidatura completa<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
      </Link>
    </li>)}</ul>}
  </PageShell>
}
