"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Search, Users } from "lucide-react"

import { ROUTES } from "@/lib/config/routes"
import { PageHeader, PageShell } from "@/components/ui/page"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { InputWithIcon } from "@/components/ui/form-field"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { StageProgress } from "@/components/company/processes/stage-progress"
import { SegmentedControl } from "@/components/company/segmented-control"
import { formatRelativeDate } from "@/lib/format"
import { useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import type { Candidatura } from "@/lib/types/candidatura.types"

type StatusFilter = "todos" | "novos" | "andamento" | "aprovados" | "encerrados"

const MATCHERS: Record<StatusFilter, (item: Candidatura) => boolean> = {
  todos: () => true,
  novos: (item) => item.status === "EM_ANDAMENTO" && (item.etapaAtual === "INSCRICAO" || item.etapaAtual === "TRIAGEM"),
  andamento: (item) => item.status === "EM_ANDAMENTO",
  aprovados: (item) => item.status === "APROVADA",
  encerrados: (item) => item.status === "REPROVADA" || item.status === "CANCELADA",
}

export function CompanyCandidatesScreen() {
  const { candidaturas, loading, error, refetch } = useCandidaturasEmpresa()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("todos")
  const [vagaId, setVagaId] = useState("")

  const vagas = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of candidaturas) map.set(item.vagaId, item.vagaTitulo)
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
  }, [candidaturas])

  const base = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR")
    return candidaturas
      .filter((item) => !vagaId || item.vagaId === vagaId)
      .filter(
        (item) =>
          !term ||
          [item.candidatoNome, item.candidatoHeadline, item.candidatoEmail, item.vagaTitulo]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("pt-BR")
            .includes(term),
      )
  }, [candidaturas, query, vagaId])

  const visible = useMemo(
    () => base.filter(MATCHERS[status]).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [base, status],
  )

  if (loading) return <RouteSkeleton variant="candidates" />

  const hasFilter = Boolean(query.trim()) || Boolean(vagaId) || status !== "todos"
  const clear = () => {
    setQuery("")
    setVagaId("")
    setStatus("todos")
  }

  return (
    <PageShell className="max-w-[1380px]">
      <PageHeader title="Candidatos" description="Todos os perfis que se candidataram às suas vagas, com a etapa e a situação de cada um." />

      <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SegmentedControl
          label="Filtrar por situação"
          value={status}
          onChange={setStatus}
          options={[
            { value: "todos", label: "Todos", count: base.length },
            { value: "novos", label: "Aguardando triagem", count: base.filter(MATCHERS.novos).length },
            { value: "andamento", label: "Em andamento", count: base.filter(MATCHERS.andamento).length },
            { value: "aprovados", label: "Aprovados", count: base.filter(MATCHERS.aprovados).length },
            { value: "encerrados", label: "Encerrados", count: base.filter(MATCHERS.encerrados).length },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            className="field-input sm:w-56"
            value={vagaId}
            onChange={(event) => setVagaId(event.target.value)}
            aria-label="Filtrar por vaga"
          >
            <option value="">Todas as vagas</option>
            {vagas.map(([id, titulo]) => (
              <option key={id} value={id}>
                {titulo}
              </option>
            ))}
          </select>
          <InputWithIcon
            wrapperClassName="sm:w-72"
            icon={Search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, cargo ou e-mail"
            aria-label="Buscar candidatos"
          />
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState
            description={error}
            action={
              <button className="btn-secondary" onClick={() => void refetch()}>
                Tentar novamente
              </button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilter ? "Nenhum candidato encontrado" : "Nenhuma candidatura recebida"}
            description={hasFilter ? "Ajuste os filtros ou a busca para ver outros perfis." : "Os candidatos aparecerão aqui assim que se inscreverem nas suas vagas."}
            action={
              hasFilter ? (
                <button type="button" className="btn-secondary" onClick={clear}>
                  Limpar filtros
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:hidden">
              {visible.map((item) => (
                <li key={item.id}>
                  <Link
                    href={ROUTES.company.candidate(item.id)}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      <EntityAvatar name={item.candidatoNome} src={item.candidatoImagemUrl} size="md" className="rounded-full" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{item.candidatoNome ?? "Candidato"}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.candidatoHeadline || item.candidatoEmail}</p>
                      </div>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="flex items-end justify-between gap-3 rounded-xl bg-surface p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-strong-foreground">{item.vagaTitulo}</p>
                        <p className="text-[11px] text-subtle-foreground">{formatRelativeDate(item.createdAt)}</p>
                      </div>
                      <StageProgress item={item} className="items-end" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Lista de candidatos</caption>
                <thead className="border-b border-border-subtle bg-surface text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Candidato</th>
                    <th scope="col" className="px-3 py-3 font-medium">Vaga</th>
                    <th scope="col" className="px-3 py-3 font-medium">Etapa</th>
                    <th scope="col" className="px-3 py-3 font-medium">Situação</th>
                    <th scope="col" className="px-3 py-3 font-medium">Inscrição</th>
                    <th scope="col" className="w-10 px-5 py-3"><span className="sr-only">Abrir</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {visible.map((item) => (
                    <tr key={item.id} className="group relative transition-colors hover:bg-muted/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <EntityAvatar name={item.candidatoNome} src={item.candidatoImagemUrl} size="sm" className="rounded-full" />
                          <div className="min-w-0">
                            <Link
                              href={ROUTES.company.candidate(item.id)}
                              className="block truncate font-semibold text-foreground after:absolute after:inset-0 group-hover:text-primary"
                            >
                              {item.candidatoNome ?? "Candidato"}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">{item.candidatoHeadline || item.candidatoEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-56 truncate px-3 py-3.5 text-strong-foreground">{item.vagaTitulo}</td>
                      <td className="px-3 py-3.5">
                        <StageProgress item={item} />
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <ChevronRight aria-hidden className="ml-auto size-4 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}
